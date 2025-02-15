#!/bin/bash

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found! Please create a .env file with the required variables."
    exit 1
fi

# Konfigurasi
PROJECT_NAME="hipmi"
REPO_NAME="hipmi"
PROJECT_PATH="/root/projects/staging/$PROJECT_NAME/"
RELEASE_NAME=$1
RELEASE_PATH="$PROJECT_PATH/releases"
ENV_PATH="$PROJECT_PATH/shared/env"
SCRIPT_PATH="$PROJECT_PATH/scripts"
ENV_NAME="staging"
REPO="https://github.com/bipproduction/$REPO_NAME.git"
BRANCH="staging"

# Jika RELEASE_NAME tidak diberikan, ambil SHA dari commit terakhir di branch staging
if [ -z "$RELEASE_NAME" ]; then
    echo "No release name provided. Fetching the latest commit SHA from the $BRANCH branch..."
    if [ -z "$TOKEN" ]; then
        echo "GitHub token not found in .env file!"
        exit 1
    fi

    # Ambil SHA commit terbaru dari API GitHub
    API_URL="https://api.github.com/repos/bipproduction/$REPO_NAME/branches/$BRANCH"
    RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "$API_URL")
    
    # Ekstrak SHA commit terbaru
    SHA=$(echo "$RESPONSE" | grep -oP '"sha":\s*"\K[^"]+' | head -n 1)

    if [ -z "$SHA" ]; then
        echo "Failed to fetch the latest commit SHA!"
        echo "API Response: $RESPONSE"
        exit 1
    fi

    # Validasi panjang SHA (harus 40 karakter)
    if [ ${#SHA} -ne 40 ]; then
        echo "Invalid SHA length: $SHA"
        exit 1
    fi

    RELEASE_NAME=$SHA
    echo "Using commit SHA as release name: $RELEASE_NAME"
fi

# VALIDASI INPUT
if [ -z "$RELEASE_NAME" ]; then
    echo "Release name is empty! Please provide a valid release name or allow fetching the latest commit SHA."
    exit 1
fi

# CEK EXISTING DIRECTORY
if [ -d "$RELEASE_PATH/$RELEASE_NAME" ]; then
    echo "Error: Directory '$RELEASE_PATH/$RELEASE_NAME' already exists. Please choose a different release name."
    exit 1
fi

# CLONE REPOSITORY
echo "Cloning repository..."
git clone -b "$BRANCH" "$REPO" "$RELEASE_PATH/$RELEASE_NAME" || { echo "Failed to clone repository!"; exit 1; }

# CHECK ENVIRONMENT FILE
if [ ! -f "$ENV_PATH/.env.$ENV_NAME" ]; then
    echo "Environment file $ENV_PATH/.env.$ENV_NAME not found!"
    exit 1
fi

# COPY ENV FILE
cp "$ENV_PATH/.env.$ENV_NAME" "$RELEASE_PATH/$RELEASE_NAME/.env"

# NAVIGATE TO RELEASE DIRECTORY
cd "$RELEASE_PATH/$RELEASE_NAME" || { echo "Failed to navigate to directory!"; exit 1; }

# INSTALL DEPENDENCIES
echo "Installing dependencies with --smol flag..."
bun i || { echo "Install dependencies failed!"; exit 1; }

# BUILD RELEASE
echo "Building release with --smol flag..."
nice -n 19 bun --smol run build || { echo "Build failed!"; exit 1; }

# PUSH PRISMA
echo "Pushing Prisma schema to database..."
nice -n 19 bunx prisma db push || { echo "Prisma DB push failed!"; exit 1; }

# PROMOTE RELEASE
SOURCE_DIR="$RELEASE_PATH/$RELEASE_NAME"
TARGET_DIR="$PROJECT_PATH/current"
if [ -L "$TARGET_DIR" ]; then
    echo "Removing existing symlink at $TARGET_DIR..."
    rm "$TARGET_DIR" || { echo "Failed to remove existing symlink!"; exit 1; }
fi
ln -s "$SOURCE_DIR" "$TARGET_DIR" || { echo "Failed to create symlink!"; exit 1; }
if [ ! -L "$TARGET_DIR" ]; then
    echo "Error: Symlink creation failed!"
    exit 1
fi
echo "Symlink successfully created from $SOURCE_DIR to $TARGET_DIR"

# RESTART SERVER
echo "Restarting server..."
pm2 restart "$PROJECT_NAME-$ENV_NAME" || { echo "Failed to restart $PROJECT_NAME-$ENV_NAME namespace!"; exit 1; }