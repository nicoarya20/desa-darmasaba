# ==============================
# Stage 1: Builder (Debian)
# ==============================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies yang sebelumnya pakai apk
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    git \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lockb* ./

ENV ONNXRUNTIME_NODE_INSTALL_CUDA=0
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

RUN npm install --ignore-scripts

COPY . .

# Skip telemetry & limit memory
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Generate prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build


# ==============================
# Stage 2: Runner (Debian)
# ==============================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Buat user non-root (cara Debian)
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
