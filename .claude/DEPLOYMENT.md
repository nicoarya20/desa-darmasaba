# Deployment

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="/"
BASE_SESSION_KEY="..."      # random string
BASE_TOKEN_KEY="..."        # random string
SESSION_PASSWORD="..."      # min 32 chars
SEAFILE_TOKEN="..."
SEAFILE_REPO_ID="..."
SEAFILE_URL="..."
```

## Docker

Multi-stage build: `oven/bun:1-debian` → builder → runner. The runner creates a `nextjs` user (UID 1001), exposes port 3000, and mounts `/app/uploads` as a volume. Entrypoint runs migrations automatically.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `docker-publish.yml` — triggers on `v*` tags, pushes to GHCR
- `publish.yml` — manual build & push
- `re-pull.yml` — triggers Portainer to redeploy latest image

To release: tag with `git tag -a v0.1.x -m "..."` and push the tag.
