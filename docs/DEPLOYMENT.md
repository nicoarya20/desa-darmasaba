# Deployment

## Environment Variables

Copy `.env.example` to `.env`. Key variables (see `.env.example` for the full, current list — it has grown beyond this summary):

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="/"
BASE_SESSION_KEY="..."      # random string
BASE_TOKEN_KEY="..."        # random string
SESSION_PASSWORD="..."      # min 32 chars

# Better Auth (Google OAuth) — current auth mechanism
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SUPER_ADMIN_EMAIL="..."

# MinIO — sole object storage backend (replaced Seafile)
MINIO_ENDPOINT="..."
MINIO_ACCESS_KEY="..."
MINIO_SECRET_KEY="..."
MINIO_BUCKET="..."
MINIO_USE_SSL="..."

# Other integrations (WhatsApp, email, Telegram bot, ElevenLabs) also exist in
# .env.example — check there before assuming a var is unused.
```

Seafile has been fully replaced by MinIO (see `prisma/migrate-seafile-to-minio.ts` for the one-off migration script). `SEAFILE_*` and `WIBU_UPLOAD_DIR`/`WIBU_DOWNLOAD_DIR` are still declared in `.env.example` but are leftovers — no active code path reads them (see `docs/DATABASE.md`).

## Operator: backfill ukuran berkas (`FileStorage.size`)

Migrasi `20261109150000_add_file_storage_size` menambah kolom `FileStorage.size` (byte, nullable). Upload baru langsung mengisinya; baris lama tetap `NULL` sampai backfill dijalankan **sekali** setelah migrasi, dari container/host yang punya `DATABASE_URL` + env MinIO yang sama dengan aplikasi:

```bash
bun run backfill:file-size   # = bun run prisma/backfill-file-size.ts
```

- Memproses baris `size IS NULL` per 100 (urut id), `statObject` ke `<path>/<name>` di `MINIO_BUCKET`; dokumen ter-gzip diisi ukuran aslinya (trailer gzip).
- Idempoten — aman diulang; baris yang sudah terisi tidak disentuh.
- Objek MinIO yang hilang/error dicatat (`gagal id=<id> (<kode>)`) lalu dilewati; exit code 1 bila ada yang gagal. Baris gagal tetap `NULL` (endpoint ZIP dokumen DAK fallback ke `statObject`).

## Docker

Multi-stage build: `oven/bun:1.4.4-debian` (pinned) → builder → runner. The Dockerfile uses `COPY --chmod`, which needs BuildKit (`docker buildx`; CI uses `docker/setup-buildx-action`). The legacy builder fails at the runner stage. `next build` uses Turbopack (Next 16 default) and needs roughly 2.5 GB RAM inside the build container. The runner creates a `nextjs` user (UID 1001), exposes port 3000, and mounts `/app/uploads` as a volume. Entrypoint runs migrations automatically (`bunx prisma migrate deploy`).

**Patched dependencies.** `package.json` → `patchedDependencies` applies `patches/*.patch` during `bun install` (currently `next-view-transitions@0.3.5`: handles the `AbortError` from skipped view transitions). The Dockerfile copies `patches/` before `bun install --frozen-lockfile`; without it the install fails with `patch file not found`. Upgrading a patched package means recreating the patch (`bun patch <pkg>` → edit → `bun patch --commit`) or removing its entry.

Since Next 16, `next dev` writes its output to `.next/dev`, separate from the `next build` output in `.next/`.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `docker-publish.yml` — triggers on `v*` git tags, pushes to GHCR. **Appears unused in practice** — the last tag in the repo is `v0.0.3`, while `package.json` is already at `0.1.19x`+. Don't rely on tagging to trigger a release.
- `publish.yml` — `workflow_dispatch` (manual trigger), **not** tied to branch `main`. Inputs: `stack_env` (dev/stg/prod — also used as the git ref to check out), `tag` (image tag, free-form manual input — in practice set to match `package.json` version), `stack_name`.
- `re-pull.yml` — `workflow_dispatch` (manual trigger). Inputs: `stack_env`, `stack_name` (also free-form, not hardcoded to `desa-darmasaba`). Redeploys the stack in Portainer. Run this only after `publish.yml` succeeds for the same tag.

## Release Flow (actual, current)

The real release flow is version-bump-driven, not git-tag-driven:
1. Bump `version` in `package.json`.
2. Commit (`chore: bump version to X.Y.Z for stg deploy`) and push to the target branch (`stg` or `prod`).
3. Trigger `publish.yml` (`workflow_dispatch`) with `tag` = the new `package.json` version and `stack_env` matching the branch.
4. Trigger `re-pull.yml` (`workflow_dispatch`) with the same `stack_env`/`stack_name` to redeploy via Portainer.

This flow is exactly what the `deploy-stg` MCP tool automates (`bump_version` → `commit_and_push_stg` → `trigger_publish` → `trigger_repull`, with `check_stg_version`/`check_migrations`/`watch_workflow_run` for verification) — prefer that tool over manual steps when deploying to stg.
