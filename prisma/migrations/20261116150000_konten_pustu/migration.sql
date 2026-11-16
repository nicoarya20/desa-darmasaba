-- Kenapa: menu Kesehatan → Puskesmas diganti menjadi PUSTU (Puskesmas Pembantu) dengan konten lengkap sesuai
-- data desa: jam operasional per rentang hari, media sosial, layanan unggulan, prosedur pendaftaran, tarif
-- BPJS & umum, struktur organisasi (bagan + pengurus), dan galeri foto. Tabel/model tetap `Puskesmas`
-- (kontrak URL & ID menu tidak berubah). Murni additive + pelonggaran NOT NULL; tidak ada kolom yang dihapus.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS, cek pg_constraint, backfill hanya baris yang masih NULL).

-- Kenapa nullable: kolom jam lama (workDays = jam buka, weekDays = jam tutup, holiday = teks akhir pekan) tidak
-- cocok dengan format desa (beberapa rentang hari). Kode baru menulis `jadwal`; kolom lama dibiarkan berisi data
-- lama tetapi tidak lagi wajib untuk baris baru.
ALTER TABLE "JamOperasional" ALTER COLUMN "workDays" DROP NOT NULL;
ALTER TABLE "JamOperasional" ALTER COLUMN "weekDays" DROP NOT NULL;
ALTER TABLE "JamOperasional" ALTER COLUMN "holiday" DROP NOT NULL;
-- Kenapa JSONB (bukan tabel): daftar { hari, jam } kecil, selalu dibaca utuh bersama barisnya.
ALTER TABLE "JamOperasional" ADD COLUMN IF NOT EXISTS "jadwal" JSONB;

-- Kenapa nullable: tidak semua PUSTU punya email/telepon; facebook pindah ke `Puskesmas.mediaSosial`
-- (kolom lama dipertahankan agar nilai yang tidak bisa dijadikan URL tidak hilang).
ALTER TABLE "KontakPuskesmas" ALTER COLUMN "kontakPuskesmas" DROP NOT NULL;
ALTER TABLE "KontakPuskesmas" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "KontakPuskesmas" ALTER COLUMN "facebook" DROP NOT NULL;
ALTER TABLE "KontakPuskesmas" ALTER COLUMN "kontakUGD" DROP NOT NULL;

-- AlterTable
-- Kenapa JSONB: daftar { platform, url } dan { judul, deskripsi } kecil, selalu dibaca utuh bersama barisnya;
-- bentuknya dijaga skema zod di API (src/lib/konten-bersama/, src/lib/pustu/).
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "mediaSosial" JSONB;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "layananUnggulan" JSONB;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "linkPetunjukArah" TEXT;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "prosedurPendaftaran" TEXT;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "tarifBpjs" TEXT;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "tarifUmum" TEXT;
ALTER TABLE "Puskesmas" ADD COLUMN IF NOT EXISTS "fotoBaganStrukturId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PengurusPustu" (
    "id" TEXT NOT NULL,
    "pustuId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "imageId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengurusPustu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FotoKegiatanPustu" (
    "id" TEXT NOT NULL,
    "pustuId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoKegiatanPustu_pkey" PRIMARY KEY ("id")
);

-- Kenapa: pengurus & foto selalu dibaca per PUSTU, urut `urutan`.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "PengurusPustu_pustuId_urutan_idx" ON "PengurusPustu"("pustuId", "urutan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FotoKegiatanPustu_pustuId_urutan_idx" ON "FotoKegiatanPustu"("pustuId", "urutan");

-- Kenapa SET NULL: bagan opsional; berkas yang terhapus cukup mengosongkan rujukan, PUSTU tetap ada.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Puskesmas_fotoBaganStrukturId_fkey') THEN
    ALTER TABLE "Puskesmas" ADD CONSTRAINT "Puskesmas_fotoBaganStrukturId_fkey"
      FOREIGN KEY ("fotoBaganStrukturId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: pengurus/foto tidak bermakna tanpa PUSTU-nya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusPustu_pustuId_fkey') THEN
    ALTER TABLE "PengurusPustu" ADD CONSTRAINT "PengurusPustu_pustuId_fkey"
      FOREIGN KEY ("pustuId") REFERENCES "Puskesmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa SET NULL: foto pengurus opsional; pengurus tetap tampil (inisial) bila berkasnya hilang.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusPustu_imageId_fkey') THEN
    ALTER TABLE "PengurusPustu" ADD CONSTRAINT "PengurusPustu_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanPustu_pustuId_fkey') THEN
    ALTER TABLE "FotoKegiatanPustu" ADD CONSTRAINT "FotoKegiatanPustu_pustuId_fkey"
      FOREIGN KEY ("pustuId") REFERENCES "Puskesmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: foto galeri tanpa berkasnya tidak bisa ditampilkan (pola sama FotoKegiatanBankSampah).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanPustu_imageId_fkey') THEN
    ALTER TABLE "FotoKegiatanPustu" ADD CONSTRAINT "FotoKegiatanPustu_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa backfill jadwal: halaman publik lama menampilkan "Senin – Jumat: {workDays} – {weekDays}" dan
-- "Sabtu – Minggu / Hari Libur: {holiday}". Isi yang sama disalin ke `jadwal` agar tampilan tidak kosong setelah
-- kode baru hanya membaca `jadwal`. Placeholder "-" / "–" / kosong dilewati. Hanya baris yang `jadwal`-nya NULL.
UPDATE "JamOperasional" AS j
SET "jadwal" = isi."jadwal"
FROM (
  SELECT e."id", jsonb_agg(e."entri" ORDER BY e."urut") AS "jadwal"
  FROM (
    SELECT "id", 1 AS "urut",
      jsonb_build_object('hari', 'Senin – Jumat', 'jam', concat_ws(' – ',
        NULLIF(NULLIF(NULLIF(btrim("workDays"), ''), '-'), '–'),
        NULLIF(NULLIF(NULLIF(btrim("weekDays"), ''), '-'), '–'))) AS "entri"
    FROM "JamOperasional"
    WHERE "jadwal" IS NULL
      AND COALESCE(NULLIF(NULLIF(NULLIF(btrim("workDays"), ''), '-'), '–'),
                   NULLIF(NULLIF(NULLIF(btrim("weekDays"), ''), '-'), '–')) IS NOT NULL
    UNION ALL
    SELECT "id", 2 AS "urut",
      jsonb_build_object('hari', 'Sabtu – Minggu / Hari Libur', 'jam', btrim("holiday")) AS "entri"
    FROM "JamOperasional"
    WHERE "jadwal" IS NULL
      AND NULLIF(NULLIF(NULLIF(btrim("holiday"), ''), '-'), '–') IS NOT NULL
  ) AS e
  GROUP BY e."id"
) AS isi
WHERE j."id" = isi."id" AND j."jadwal" IS NULL;

-- Kenapa backfill media sosial: kolom `facebook` lama tidak ditampilkan lagi; nilainya dipindah ke
-- `Puskesmas.mediaSosial` sebagai { platform: "facebook", url }. Aturan sama dengan `lengkapiUrlMedsos`
-- (src/lib/konten-bersama/media-sosial.model.ts): URL http(s) apa adanya, "facebook.com/x" → https://, nama akun
-- ("@akun" / "akun.nama") → https://www.facebook.com/akun. Isian lain (email, teks berspasi, "-") tidak bisa
-- dijadikan URL aman, jadi dilewati dan tetap tersimpan di kolom lama. Hanya PUSTU yang `mediaSosial`-nya NULL.
UPDATE "Puskesmas" AS p
SET "mediaSosial" = jsonb_build_array(jsonb_build_object('platform', 'facebook', 'url',
  CASE
    WHEN btrim(k."facebook") ~* '^https?://' THEN btrim(k."facebook")
    WHEN btrim(k."facebook") ~* '^((www|m|web)\.)?(facebook|fb)\.com/' THEN 'https://' || btrim(k."facebook")
    ELSE 'https://www.facebook.com/' || regexp_replace(btrim(k."facebook"), '^@', '')
  END))
FROM "KontakPuskesmas" AS k
WHERE p."kontakId" = k."id"
  AND p."mediaSosial" IS NULL
  AND (
    btrim(k."facebook") ~* '^https?://[^[:space:]/]+[^[:space:]]*$'
    OR btrim(k."facebook") ~* '^((www|m|web)\.)?(facebook|fb)\.com/[^[:space:]]+$'
    OR (
      btrim(k."facebook") ~ '^@?[A-Za-z0-9_.-]+$'
      AND btrim(k."facebook") ~ '[A-Za-z0-9]'
      AND btrim(k."facebook") !~* '\.(com|id|net|org|co|me|tv|gl)$'
    )
  );
