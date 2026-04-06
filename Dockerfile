# ==============================
# Stage 1: Builder
# ==============================
FROM oven/bun:1-debian AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    git \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lockb* ./

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN bun install --frozen-lockfile
COPY . .

RUN cp .env.example .env || true

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN bunx prisma generate

RUN bun run build

# ==============================
# Stage 2: Runner (Production)
# ==============================
FROM oven/bun:1-debian AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "start"]