# Task: Tambah Statistik Persentase ke RingkasanKesehatanDesa

## Tujuan
Lengkapi schema + API `RingkasanKesehatanDesa` dengan 4 field persentase
agar dashboard Statistik Kesehatan (Imunisasi, Pemeriksaan Rutin, Gizi Baik,
Target Stunting) punya backend yang bisa di-fetch.

## Field Baru
Tambah ke model `RingkasanKesehatanDesa` (additive, tidak ubah field lama):

| Field | Tipe | Default | Keterangan |
|---|---|---|---|
| `imunisasiLengkapPct` | Int | 0 | Persentase imunisasi lengkap (0-100) |
| `pemeriksaanRutinPct` | Int | 0 | Persentase pemeriksaan rutin (0-100) |
| `giziBaikPct` | Int | 0 | Persentase gizi baik (0-100) |
| `targetStuntingPct` | Int | 0 | Persentase target stunting (0-100) |

## Step A — Schema + API

- [x] 1. Edit `prisma/schema.prisma` — tambah 4 field
- [x] 2. Buat migration manual `20260504000000_add_statistik_pct_ringkasan_kesehatan/migration.sql` (mode interaktif tidak tersedia di sandbox)
- [x] 3. `findUnique.ts` tidak perlu diubah — `findFirst` tanpa `select` otomatis bawa field baru
- [x] 4. `updt.ts` + `index.ts` — handler create/update + Elysia body validation (range 0-100)
- [x] 5. `bun run build` — exit 0
- [x] 6. Bump `0.1.48 → 0.1.49`
- [x] 7. Commit `feat(kesehatan): tambah 4 field statistik pct...` + push branch `tasks/statistik-kesehatan-ringkasan/add-pct-fields/20260504` + merge ke `stg`

## Step B — State File Admin

- [x] 1. Bikin `_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan.ts` (Valtio + zod)
- [x] 2. `findUnique.load()` — GET + sync ke form
- [x] 3. `update.submit()` — zod validate (count ≥ 0, Pct 0-100) + PUT + refresh
- [x] 4. `update.reset()`
- [x] 5. `bun run build` — exit 0
- [x] 6. Bump `0.1.49 → 0.1.50`
- [x] 7. Commit + push ke `stg` (2 remote)

## Pending Manual

- [ ] User jalankan `bunx prisma migrate deploy` di terminal lokal — apply 4 kolom baru ke DB
- [ ] Trigger GitHub Workflow (publish + re-pull) bila mau deploy ke STG

## Prinsip
- Additive only — field lama (`ibuHamilAkh`, `balitaTerdaftar`, `alertStunting`) tidak disentuh
- Validasi range 0-100 di Elysia `updt.ts`
- Tidak ada breaking change kontrak
