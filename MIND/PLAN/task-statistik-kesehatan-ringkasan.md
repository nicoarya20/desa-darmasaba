# Task: Refactor Ringkasan Kesehatan → Dashboard Auto-Derived

## Latar Belakang

Page `/admin/kesehatan/ringkasan-kesehatan` saat ini = form `NumberInput`
manual (7 angka diketik operator). Itu **salah konsep**: "Ringkasan" harus
**hasil agregasi** dari data sumber, bukan input bebas.

Solusi: bikin 2 entitas data sumber (`IbuHamil`, `Balita`), lalu derive
KPI + statistik kesehatan dari query agregat. Page ringkasan jadi
**dashboard read-only** + tombol "Kelola Ibu Hamil" / "Kelola Balita".

## Mapping Field → Sumber Data

| Field di Ringkasan | Sumber |
|---|---|
| `ibuHamilAktif` | `count(IbuHamil where status=AKTIF, isActive=true)` |
| `balitaTerdaftar` | `count(Balita where isActive=true)` |
| `alertStunting` | `count(Balita where statusStunting IN [ALERT, STUNTING])` |
| `imunisasiLengkapPct` | `count(imunisasiLengkap=true) / total balita * 100` |
| `pemeriksaanRutinPct` | `count(pemeriksaanRutin=true) / total balita * 100` |
| `giziBaikPct` | `count(giziBaik=true) / total balita * 100` |
| `targetStuntingPct` | tetap di `RingkasanKesehatanDesa` (policy target, bukan derived) |

## Kontrak Lama (jaga, AI-CONTRACT §10)

- `GET /api/kesehatan/ringkasankesehatan/find` — tetap return shape lama
- `PUT /api/kesehatan/ringkasankesehatan/update` — tetap menerima 7 field lama
- Tambah baru: `GET /api/kesehatan/ringkasankesehatan/stats` (agregat)
- Tambah baru: `/api/kesehatan/ibuhamil/*`, `/api/kesehatan/balita/*`

> Alasan: ada konsumer eksternal (mobile/landing) yang mungkin sudah
> baca shape lama. Refactor admin tidak boleh memutus kontrak existing.
> Field manual lama akan ditandai deprecated di komentar schema saat
> tidak lagi dipakai admin UI.

---

## Step A — Model `IbuHamil`

### Schema

```prisma
enum IbuHamilStatus {
  AKTIF
  MELAHIRKAN
  KEGUGURAN
  NONAKTIF
}

model IbuHamil {
  id            String         @id @default(cuid())
  nama          String
  nik           String?
  usiaKehamilan Int            @default(0)        // minggu
  hpht          DateTime?                          // hari pertama haid terakhir
  taksiranLahir DateTime?
  alamat        String?
  noHp          String?
  catatan       String?
  posyanduId    String?
  posyandu      Posyandu?      @relation(fields: [posyanduId], references: [id], onDelete: SetNull)
  status        IbuHamilStatus @default(AKTIF)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  isActive      Boolean        @default(true)
}
```

### API `src/app/api/[[...slugs]]/_lib/kesehatan/ibu-hamil/`

Pattern mirror `posyandu/`:
- `index.ts` — Elysia routes (prefix `/ibuhamil`)
- `create.ts` — POST `/create`
- `find-many.ts` — GET `/find-many?page=&limit=&search=&status=`
- `find-by-id.ts` — GET `/:id`
- `updt.ts` — PUT `/:id`
- `del.ts` — DELETE `/del/:id` (soft delete `isActive=false`)

Daftarkan di `kesehatan/index.ts`: `.use(IbuHamil)`

### Checklist

- [ ] 1. Tambah enum `IbuHamilStatus` + model `IbuHamil` ke `prisma/schema.prisma`
- [ ] 2. Tambah `@relation` reverse di model `Posyandu` (`ibuHamil IbuHamil[]`)
- [ ] 3. Generate migration `add_ibu_hamil` (manual SQL bila sandbox)
- [ ] 4. Buat 6 file API (index/create/find-many/find-by-id/updt/del)
- [ ] 5. Register di `kesehatan/index.ts`
- [ ] 6. State file `src/app/admin/(dashboard)/_state/kesehatan/ibu-hamil/ibuHamil.ts`
      pattern Valtio + zod (mirror `posyandu/posyandu.ts`)
- [ ] 7. Admin pages:
      - `src/app/admin/(dashboard)/kesehatan/ibu-hamil/page.tsx` (list)
      - `src/app/admin/(dashboard)/kesehatan/ibu-hamil/create/page.tsx`
      - `src/app/admin/(dashboard)/kesehatan/ibu-hamil/edit/[id]/page.tsx`
- [ ] 8. Sidebar entry: tambah "Ibu Hamil" di group Kesehatan
- [ ] 9. `bun run build` exit 0
- [ ] 10. Bump version + commit + push

---

## Step B — Model `Balita`

### Schema

```prisma
enum JenisKelaminBalita {
  L
  P
}

enum StatusStunting {
  NORMAL
  ALERT
  STUNTING
}

model Balita {
  id               String              @id @default(cuid())
  nama             String
  nik              String?
  tanggalLahir     DateTime
  jenisKelamin     JenisKelaminBalita
  beratBadanKg     Float?
  tinggiBadanCm    Float?
  namaOrtu         String?
  alamat           String?
  noHpOrtu         String?
  posyanduId       String?
  posyandu         Posyandu?           @relation(fields: [posyanduId], references: [id], onDelete: SetNull)
  imunisasiLengkap Boolean             @default(false)
  giziBaik         Boolean             @default(true)
  pemeriksaanRutin Boolean             @default(true)
  statusStunting   StatusStunting      @default(NORMAL)
  catatan          String?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
  isActive         Boolean             @default(true)
}
```

### API `src/app/api/[[...slugs]]/_lib/kesehatan/balita/`

Sama pattern dengan ibu-hamil (6 file). Body validator Elysia:

```ts
t.Object({
  nama: t.String(),
  nik: t.Optional(t.String()),
  tanggalLahir: t.String(),                 // ISO string
  jenisKelamin: t.Union([t.Literal('L'), t.Literal('P')]),
  beratBadanKg: t.Optional(t.Number()),
  tinggiBadanCm: t.Optional(t.Number()),
  namaOrtu: t.Optional(t.String()),
  alamat: t.Optional(t.String()),
  noHpOrtu: t.Optional(t.String()),
  posyanduId: t.Optional(t.String()),
  imunisasiLengkap: t.Boolean(),
  giziBaik: t.Boolean(),
  pemeriksaanRutin: t.Boolean(),
  statusStunting: t.Union([t.Literal('NORMAL'), t.Literal('ALERT'), t.Literal('STUNTING')]),
  catatan: t.Optional(t.String()),
})
```

### Checklist

- [ ] 1. Tambah enum + model `Balita` ke schema
- [ ] 2. `@relation` reverse di Posyandu (`balita Balita[]`)
- [ ] 3. Migration `add_balita`
- [ ] 4. 6 file API
- [ ] 5. Register di `kesehatan/index.ts`
- [ ] 6. State file `_state/kesehatan/balita/balita.ts`
- [ ] 7. Admin pages list / create / edit (form dengan 4 toggle:
      `imunisasiLengkap`, `giziBaik`, `pemeriksaanRutin` + Select
      `statusStunting`)
- [ ] 8. Sidebar entry "Balita" di group Kesehatan
- [ ] 9. `bun run build` exit 0
- [ ] 10. Bump version + commit + push

---

## Step C — Endpoint Stats Agregat

### File baru `src/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan/stats.ts`

Return:

```ts
{
  ibuHamilAktif: number,
  balitaTerdaftar: number,
  alertStunting: number,
  imunisasiLengkapPct: number,    // round
  pemeriksaanRutinPct: number,
  giziBaikPct: number,
  targetStuntingPct: number,       // dari RingkasanKesehatanDesa
}
```

Implementasi (Prisma):
- 1 `count` IbuHamil + 1 `groupBy` Balita (status flags)
- Hitung pct di JS: `Math.round((n / total) * 100)`
- Edge case `total=0` → semua pct = 0

### Checklist

- [ ] 1. Bikin `stats.ts` handler
- [ ] 2. Daftarkan route `GET /stats` di `ringkasan-kesehatan/index.ts`
- [ ] 3. Update state `ringkasanKesehatan.ts`:
      - tambah `findStats: { data, loading, load() }`
      - method lama `findUnique` + `update` → tetap (kontrak)
- [ ] 4. Refactor `page.tsx` ringkasan:
      - section atas: 7 stat card read-only dari `findStats.data`
      - section bawah: form kecil hanya `targetStuntingPct` (policy target)
      - 2 tombol: "Kelola Ibu Hamil" → push `/admin/kesehatan/ibu-hamil`
        "Kelola Balita" → push `/admin/kesehatan/balita`
- [ ] 5. `bun run build` exit 0
- [ ] 6. Bump version + commit + push

---

## Step D — Cleanup (opsional, tunggu user konfirmasi)

Field manual `ibuHamilAkh`, `balitaTerdaftar`, `alertStunting`,
`imunisasiLengkapPct`, `pemeriksaanRutinPct`, `giziBaikPct` di
`RingkasanKesehatanDesa` jadi **deprecated**.

- Opsi 1 (aman): tinggalkan, tandai `// DEPRECATED — derived from /stats`
- Opsi 2 (bersih): hapus + bump major version + update kontrak konsumer

**Tunggu input user** — jangan eksekusi tanpa izin.

---

## Pending Manual

- [ ] User jalankan `bunx prisma migrate deploy` di lokal setelah Step A & B
- [ ] User trigger publish + re-pull workflow bila mau deploy STG

## Prinsip

- **Additive**: kontrak `/find` + `/update` ringkasankesehatan tetap
- **Single source of truth**: KPI = derived dari IbuHamil + Balita
- **Soft delete** pakai `isActive=false`, jangan hard delete
- **YAGNI**: belum bikin chart/grafik tren; cukup angka snapshot
- **No breaking change**: konsumer landing/mobile aman selama migrasi
