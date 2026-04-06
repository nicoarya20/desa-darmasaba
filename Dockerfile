# # Stage 1: Build
# FROM oven/bun:1.1 AS build

# # Install build dependencies for native modules
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     && rm -rf /var/lib/apt/lists/*

# # Set the working directory
# WORKDIR /app

# # Disable telemetry and set build-time environment
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV NODE_ENV=production
# ENV NODE_OPTIONS="--max-old-space-size=4096"
# # Critical ENV for API route evaluation during build
# ENV WIBU_UPLOAD_DIR=uploads
# ENV DATABASE_URL="postgresql://bip:Production_123@pgbouncer:5432/desa-darmasaba-staging?pgbouncer=true"

# # Copy package files
# COPY package.json bun.lock* ./

# # Install dependencies with frozen lockfile
# RUN bun install --frozen-lockfile

# # Copy the rest of the application code
# COPY . .

# # Use .env.example as default env for build
# RUN cp .env.example .env

# # Generate Prisma client
# RUN bun x prisma generate

# # Build the application frontend
# RUN bun run build

# # Stage 2: Runtime
# FROM oven/bun:1.1-slim AS runtime

# # Set environment variables
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# # Ensure runtime also has critical envs if they are checked at startup
# ENV WIBU_UPLOAD_DIR=uploads

# # Install runtime dependencies
# RUN apt-get update && apt-get install -y \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*

# # Set the working directory
# WORKDIR /app

# # Copy necessary files from build stage
# COPY --from=build /app/package.json ./
# COPY --from=build /app/bun.lock* ./
# COPY --from=build /app/next.config.ts ./
# COPY --from=build /app/postcss.config.cjs ./
# COPY --from=build /app/tsconfig.json ./
# COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/prisma ./prisma

# # Expose the port
# EXPOSE 3000

# # Start the application
# CMD ["bun", "start"]


# Stage 1: Build
FROM oven/bun:1.3 AS build

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
# RUN bun install --frozen-lockfile
RUN bun install --no-save

# Copy the rest of the application code
COPY . .

# Use .env.example as default env for build
RUN cp .env.example .env

# Generate Prisma client
RUN bun x prisma generate

# Generate API types
RUN bun run gen:api || echo "tidak ada gen api"

# Build the application frontend
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1.3-slim AS runtime

# Set environment variables
ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
