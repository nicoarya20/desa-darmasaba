# Database & Data Layer

## Prisma Schema
- Schema at `prisma/schema.prisma` (~2700 lines, 190 models)
- Common model conventions: `@default(cuid())` IDs, `createdAt`/`updatedAt` timestamps, `isActive Boolean @default(true)` — widely used but **not universal** (some lookup-style models like `Layanan`, `Potensi` have none of these).
- Soft delete via `deletedAt DateTime?` — **inconsistently implemented**. Most models use a nullable `deletedAt DateTime?` with no default (correct pattern, e.g. `FileStorage`, `Role`). A few models (`AppMenu`, `AppMenuChild`, `PejabatDesa`) declare `deletedAt @default(now())`, which defeats the purpose of soft-delete — treat these as known bugs, don't copy that pattern into new models.
- Seeders per-module in `prisma/_seeder_list/`, orchestrated by `prisma/seed.ts`
- Seeders are **create-only by default**: every seeder imports `prisma` from `prisma/seed-prisma.ts` (never `@/lib/prisma` directly — a test enforces this), which turns each `upsert` into "create if the id is missing, otherwise leave the row untouched". Seed data is only a starting point; admins edit it via CMS, and re-running the seed (done manually inside the STG container) must not overwrite those edits. Run with `SEED_OVERWRITE=true` to deliberately overwrite existing rows with the JSON (e.g. when fixing sample data locally); `seed.ts` prints which mode is active. Consequence: fixing a typo in seed JSON does not reach a DB that already has the row — edit it in the admin instead.
- Rows whose `id` was removed from the seed JSON stay in the DB (shows up as duplicate content). When replacing seed data with new ids, list the old rows in a sibling `<name>.retired.json` (`{ keterangan, data: [{ id, judul|nama, deskripsi? }] }`) and call `retireSeedRows()` from `prisma/retire-seed-rows.ts` in that seeder. It deletes only rows whose id **and** title/name **and** description still match the old seed (admin-edited rows survive) and skips rows still referenced by FK. Never sync-delete "everything not in JSON" — that would wipe admin-created data.

## Authentication Flow
Auth was rewritten to **Better Auth with Google OAuth only** (no more phone OTP). Flow:
1. User signs in with Google → Better Auth (`src/lib/auth.ts`) creates a session, stored in Postgres (`Session`, `Account`, `Verification`, `RateLimit` models — Better Auth's own schema, not custom).
2. `src/proxy.ts` (Next 16 `proxy` convention, formerly `middleware.ts`) reads Better Auth's signed cookie cache directly (`getCookieCache`/`getSessionCookie` from `better-auth/cookies`) — it does **not** decode a custom JWT. This was a deliberate choice to avoid a hang bug from fetching `/api/auth/get-session` in-container.
3. `src/lib/api-auth.ts` validates sessions in API routes via `auth.api.getSession()`.
4. Access control (which admin paths are public/protected, role checks) lives in `src/lib/auth-policy.ts`, used by both `proxy.ts` and the Elysia `route.ts`.
5. Old OTP routes (`/validasi`, `/waiting-room`) are dead and redirect to `/login`.

**Legacy/dead models still in schema, not referenced by active code** — don't build new features on these:
- `UserSession` — old JWT session tracking, superseded by Better Auth's `Session` model.
- `KodeOtp` — old phone-OTP storage, zero references in `src/`.

`src/lib/session.ts` (iron-session) is also dead code, unused by the current auth path.

## File Handling
All uploaded files reference the `FileStorage` Prisma model. **MinIO is the primary and only active storage backend** — see `src/lib/minio.ts` and usage in `src/app/api/[[...slugs]]/_lib/fileStorage/_lib/{create,del,findUniq}.ts` and `upl-img*.ts` (configured via `MINIO_ENDPOINT`/`MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`/`MINIO_BUCKET`/`MINIO_USE_SSL`).

**Hapus berkas = permanen**, lewat `removeStoredFile(file, "<Model>")` SETELAH operasi DB record sukses (baris FileStorage dulu, lalu objek MinIO; berkas yang masih dirujuk FK lain dibiarkan). Jangan panggil `minio.removeObject`/`fileStorage.delete` langsung dari handler fitur. Sampah (soft delete + purge 30 hari) hanya untuk 4 fitur koleksi: dokumen DAK, dokumen APBDes, galeri foto BUMDes, dokumen perencanaan — lihat `docs/decisions/2026-11-12-sampah.md`.

Seafile was the previous storage backend and has been fully migrated to MinIO (`prisma/migrate-seafile-to-minio.ts`). `WIBU_UPLOAD_DIR` (local disk) and Seafile (`src/lib/seafile-auth-service.ts`, `SEAFILE_*` env vars) are both leftovers — still declared in `.env.example` but not referenced by any active upload/read/delete path. Don't rely on either for new file-handling code; use MinIO.

## Jenna: percakapan publik & allowlist pengetahuan
`JennaConversation` / `JennaMessage` (migrasi `20261113170000_add_jenna_conversation`) menyimpan chat pengunjung anonim — tanpa relasi ke `User`:
- `sessionHash` / `ipHash` = HMAC-SHA256 (`hashJennaIdentifier` di `src/lib/jenna/limits.ts`); token cookie dan IP asli tidak pernah disimpan. Kedua hash didenormalisasi ke `JennaMessage` supaya kuota harian dihitung tanpa join.
- `content` sudah disamarkan (NIK/HP/email, `src/lib/jenna/pii.ts`) sebelum ditulis. `status = 'error'` + `errorCode` mencatat giliran gagal; baris ini ikut dihitung kuota/budget tapi tidak dipakai sebagai riwayat.
- Telemetri (migrasi `20261114100000_jenna_message_telemetry`, semua nullable): `latencyMs`, `providerSlot`, `model` di baris asisten bila sukses atau di baris error bila gagal; `errorDetail` = teks error provider yang sudah disanitasi (`src/lib/jenna/error-detail.ts`, maks 2000 karakter), hanya untuk role 0 dan tidak pernah dikirim ke pengunjung.
- Hapus percakapan → pesan ikut (`onDelete: Cascade`). Purge harian menghapus percakapan dengan `lastMessageAt` lebih lama dari `JennaSettings.retentionDays` (`src/lib/jenna/chat/retention.ts`).

**Allowlist pengetahuan.** Jenna tidak boleh membaca tabel lain selain lewat registry `src/lib/jenna/knowledge/sources.ts` (default deny, `select` eksplisit, tanpa `include`/`omit`). Sumber baru wajib ditambahkan di sana, dan contract test `__tests__/api/jenna_knowledge_registry.test.ts` harus tetap hijau: perubahan daftar `Model.field` mengubah snapshot (perbarui hanya bila disengaja), field berpola PII hanya boleh lewat entri eksplisit di `PII_EXCEPTIONS` (kontak organisasi), dan model data warga (submission, balita, ibu hamil, dll.) dilarang. Jangan memakai ulang endpoint find-many publik sebagai sumber. Detail: `docs/decisions/2026-11-13-jenna-public-chat.md`.
