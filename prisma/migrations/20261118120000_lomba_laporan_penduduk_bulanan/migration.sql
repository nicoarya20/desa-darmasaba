-- Batch 1 Lomba Website Desa 2027: laporan penduduk bulanan (juknis 1.3) + menu Dokumen Perencanaan (juknis 2.2).
-- Aditif dan idempoten: aman dijalankan ulang, tidak mengubah tabel/kolom lama.

-- 1) Tabel baru LaporanPendudukBulanan.
-- Kenapa: desa perlu laporan SID per banjar per bulan (laki-laki/perempuan). DataBanjar menyimpan snapshot tahunan
-- dan dipakai halaman publik + summary dashboard, jadi tidak diubah; laporan bulanan memakai tabel sendiri.
-- Tanpa unique (banjar, tahun, bulan): soft delete membuat unique index memblokir input ulang, jadi duplikat aktif
-- dicegah di API. "updatedAt" tanpa DEFAULT (Prisma @updatedAt diisi aplikasi).
CREATE TABLE IF NOT EXISTS "LaporanPendudukBulanan" (
    "id" TEXT NOT NULL,
    "banjar" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "lakiLaki" INTEGER NOT NULL,
    "perempuan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LaporanPendudukBulanan_pkey" PRIMARY KEY ("id")
);

-- Kenapa: daftar admin disaring tahun/bulan dan banjar.
CREATE INDEX IF NOT EXISTS "LaporanPendudukBulanan_tahun_bulan_idx" ON "LaporanPendudukBulanan"("tahun", "bulan");
CREATE INDEX IF NOT EXISTS "LaporanPendudukBulanan_banjar_idx" ON "LaporanPendudukBulanan"("banjar");

-- 2) Menu Access: Dokumen Perencanaan pindah dari tab Kegiatan Desa ('desa.kegiatan-desa') jadi submenu sendiri
-- ('desa.dokumen-perencanaan'). Data saja, tanpa perubahan kolom.
-- Kenapa: hak akses disimpan per ID menu (UserMenuAccess) dan halaman admin dijaga per basePath, jadi user yang
-- sekarang memegang 'desa.kegiatan-desa' akan terkunci dari Dokumen Perencanaan setelah halamannya pindah
-- (ID section 'Desa' sudah mencakup semua submenu, jadi tidak perlu diubah).
-- Pemegang 'desa.kegiatan-desa' diberi ID baru; yang sudah punya 'desa' atau ID baru dilewati. ID dicocokkan
-- trim + lowercase seperti normalizeMenuId. Baris lama dibiarkan: 'desa.kegiatan-desa' tetap menu yang valid.
INSERT INTO "UserMenuAccess" ("id", "userId", "menuId", "createdAt", "updatedAt")
SELECT
  md5('menu-dokumen-perencanaan:' || pemegang."userId" || ':' || clock_timestamp()::text),
  pemegang."userId",
  'desa.dokumen-perencanaan',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT uma."userId"
  FROM "UserMenuAccess" uma
  WHERE lower(btrim(uma."menuId")) = 'desa.kegiatan-desa'
) pemegang
WHERE NOT EXISTS (
  SELECT 1 FROM "UserMenuAccess" sudah
  WHERE sudah."userId" = pemegang."userId"
    AND lower(btrim(sudah."menuId")) IN ('desa.dokumen-perencanaan', 'desa')
)
ON CONFLICT ("userId", "menuId") DO NOTHING;
