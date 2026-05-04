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

## Step

- [ ] 1. Edit `prisma/schema.prisma` — tambah 4 field
- [ ] 2. Run migration: `bunx prisma migrate dev --name add-statistik-pct-ringkasan-kesehatan`
- [ ] 3. Update `kesehatan/ringkasan-kesehatan/findUnique.ts` — select field baru
- [ ] 4. Update `kesehatan/ringkasan-kesehatan/updt.ts` — tambah validasi Elysia + update logic
- [ ] 5. `bun run build` — pastikan 0 error
- [ ] 6. Bump version `package.json`
- [ ] 7. Commit + push branch baru

## Prinsip
- Additive only — field lama (`ibuHamilAkh`, `balitaTerdaftar`, `alertStunting`) tidak disentuh
- Validasi range 0-100 di Elysia `updt.ts`
- Tidak ada breaking change kontrak
