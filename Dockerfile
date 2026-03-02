FROM debian:bookworm-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        curl unzip ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app

# ---- deps ----
FROM base AS deps

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# ---- builder ----
FROM deps AS builder

COPY prisma ./prisma
RUN bunx prisma generate

COPY src ./src
COPY types ./types
COPY tsconfig.json ./

# BUN_PUBLIC_* vars are baked into the browser bundle at build time
ARG BUN_PUBLIC_BASE_URL
ENV BUN_PUBLIC_BASE_URL=${BUN_PUBLIC_BASE_URL}
RUN bun run build

# ---- runner ----
FROM base AS runner

COPY package.json bun.lockb ./
RUN bun install --production

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/.next ./.next
COPY src ./src
COPY prisma ./prisma
COPY types ./types
COPY tsconfig.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "./src/index.tsx"]
