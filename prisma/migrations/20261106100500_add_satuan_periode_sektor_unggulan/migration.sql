-- Kenapa (1): "value" pada SektorUnggulanDesa hanya berupa angka tanpa satuan,
-- sehingga tidak bisa dibaca sebagai hasil produksi (ton? kg? ekor? %?) dan tidak
-- jelas untuk periode mana. Ditambah "satuan" dan "periode" agar nilai bisa
-- ditampilkan "{value} {satuan} • {periode}". Keduanya nullable tanpa backfill:
-- baris lama (seed 90/45/30/20/15) tetap tanpa satuan karena belum diketahui satuan
-- aslinya; operator mengisi data produksi nyata lewat admin. Idempoten.

-- AlterTable
ALTER TABLE "SektorUnggulanDesa"
  ADD COLUMN IF NOT EXISTS "satuan" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "periode" VARCHAR(50);

-- Kenapa (2): kategori Kegiatan Desa "Kepemudaan" dan "PKK & Pemberdayaan Perempuan"
-- harus ada di STG/prod yang sudah berisi data. Entrypoint produksi hanya menjalankan
-- `prisma migrate deploy` (tanpa seed), jadi kategori dari
-- prisma/data/desa/kegiatan-desa/kategori-kegiatan.json tidak otomatis ada di sana.
-- Id sama dengan JSON. Dilewati bila id sudah ada ATAU sudah ada kategori aktif
-- bernama sama (dibuat manual lewat admin) agar filter publik tidak menampilkan
-- nama ganda. "updatedAt" wajib diisi karena @updatedAt tidak punya DEFAULT di DB;
-- "deletedAt" dibiarkan DEFAULT (jebakan lama pada KategoriKegiatan — soft-delete
-- memakai "isActive").
INSERT INTO "KategoriKegiatan" ("id", "nama", "updatedAt")
SELECT 'katkepemudaan01', 'Kepemudaan', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "KategoriKegiatan"
  WHERE "id" = 'katkepemudaan01'
     OR (lower(btrim("nama")) = 'kepemudaan' AND "isActive" = true)
);

INSERT INTO "KategoriKegiatan" ("id", "nama", "updatedAt")
SELECT 'katpkkperempuan01', 'PKK & Pemberdayaan Perempuan', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "KategoriKegiatan"
  WHERE "id" = 'katpkkperempuan01'
     OR (lower(btrim("nama")) = 'pkk & pemberdayaan perempuan' AND "isActive" = true)
);
