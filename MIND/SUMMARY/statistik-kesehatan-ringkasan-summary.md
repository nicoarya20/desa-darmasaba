# Summary: Statistik Persentase Kesehatan di RingkasanKesehatanDesa

## Konteks

Dashboard admin punya 4 progress bar (Imunisasi Lengkap, Pemeriksaan Rutin,
Gizi Baik, Target Stunting) yang sebelumnya belum ada backend-nya. Schema
`RingkasanKesehatanDesa` hanya menyimpan 3 field count (`ibuHamilAkh`,
`balitaTerdaftar`, `alertStunting`).

## Yang Dikerjakan

### Step A — Schema + API (v0.1.49)
1. **Schema** — tambah 4 field `Int @default(0)` di `RingkasanKesehatanDesa`:
   `imunisasiLengkapPct`, `pemeriksaanRutinPct`, `giziBaikPct`, `targetStuntingPct`.
2. **Migration** — buat manual SQL di
   `prisma/migrations/20260504000000_add_statistik_pct_ringkasan_kesehatan/migration.sql`
   (sandbox non-interaktif, jadi `migrate dev` di-bypass dengan SQL langsung).
3. **API** —
   - `kesehatan/ringkasan-kesehatan/updt.ts` — handler create + update terima 4 field baru.
   - `kesehatan/ringkasan-kesehatan/index.ts` — Elysia body validation `t.Number({ minimum: 0, maximum: 100 })`.
   - `findUnique.ts` tidak perlu diubah — `findFirst` tanpa `select` otomatis bawa field baru.
4. Build clean, push ke 2 remote (bipprojectbali + nicoarya20), merge ke `stg`.

### Step B — State Admin (v0.1.50)
- File baru `_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan.ts` (Valtio proxy):
  - `findUnique.load()` — GET `/api/kesehatan/ringkasankesehatan/find`, isi `data` + sync ke `update.form`.
  - `update.submit()` — zod validate (count ≥ 0, Pct 0-100) → PUT `/api/kesehatan/ringkasankesehatan/update` → refresh.
  - `update.reset()` — reset form ke default.

## Decision Log

- **Gabung ke `RingkasanKesehatanDesa`** (bukan model baru `StatistikKesehatan`)
  alasan: domain sama (ringkasan kesehatan desa), pattern existing single-row config
  cocok, single fetch untuk dashboard, migration ringan additive.
- **Tipe `Int` (0–100)** — UI render integer %, tidak butuh desimal.
- **Suffix `Pct`** — eksplisit semantik persentase (count vs persentase di model yang sama).
- **Field lama tidak disentuh** — additive only, sesuai AI-CONTRACT §10.

## Pending Manual

- Jalankan `bunx prisma migrate deploy` di terminal lokal → apply kolom baru ke DB.
- Trigger GitHub Workflow (publish + re-pull) bila mau deploy STG.

## Affected Files

```
prisma/schema.prisma
prisma/migrations/20260504000000_add_statistik_pct_ringkasan_kesehatan/migration.sql  [NEW]
src/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan/updt.ts
src/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan/index.ts
src/app/admin/(dashboard)/_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan.ts  [NEW]
package.json (0.1.48 → 0.1.50)
MIND/PLAN/task-statistik-kesehatan-ringkasan.md  [NEW]
```

## Commits

- `ba2b90be` feat(kesehatan): tambah 4 field statistik pct ke RingkasanKesehatanDesa - bump ke 0.1.49
- `68a2a639` feat(kesehatan): tambah state file ringkasanKesehatan + bump ke 0.1.50
