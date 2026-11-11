# ==============================
# Stage 1: Builder
# ==============================
FROM oven/bun:1.4.4-debian AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    git \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* bun.lockb* ./
# patchedDependencies (package.json) butuh folder patches/ saat bun install.
COPY patches ./patches

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN bun install --frozen-lockfile

COPY . .

RUN cp .env.example .env || true

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN bunx prisma generate

# Generate API types (opsional)
RUN bun run gen:api || echo "tidak ada gen api"

RUN bun run build

# ==============================
# Stage 2: Runner (Production)
# ==============================
FROM oven/bun:1.4.4-debian AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/lib ./src/lib
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./
COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

# Persistent storage for uploaded files
VOLUME ["/app/uploads"]

EXPOSE 3000

CMD ["/app/docker-entrypoint.sh"]
