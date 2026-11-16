-- Kenapa: menu "Desa Digital / Smart Village" dan "Info Teknologi Tepat Guna" berisi informasi yang sama (nama,
-- deskripsi, gambar), sehingga digabung jadi satu menu "Inovasi Teknologi Desa" dengan pembeda kategori. Tabel fisik
-- "DesaDigital" dipertahankan (model Prisma InovasiTeknologiDesa memakai @@map) supaya id, FK gambar, dan tautan
-- detail lama tetap berlaku; baris "InfoTekno" disalin ke sana sebagai kategori 'tepat-guna'.
--
-- Data aman: tabel "InfoTekno" TIDAK di-drop (cadangan sampai prod terverifikasi, hutang di
-- docs/debt/2026-11-16-drop-info-tekno.md). Seluruh langkah idempoten: aman dijalankan ulang bila sempat gagal di
-- tengah jalan.

-- 1) Kolom pembeda. Baris lama otomatis 'digital' lewat DEFAULT (tanpa backfill terpisah).
ALTER TABLE "DesaDigital" ADD COLUMN IF NOT EXISTS "kategori" TEXT NOT NULL DEFAULT 'digital';

-- 2) Penjaga nilai di DB (API juga memvalidasi): hanya 'digital' / 'tepat-guna'. Daftar sama dengan
--    INOVASI_KATEGORI di src/lib/inovasi-teknologi/kategori.ts.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DesaDigital_kategori_check' AND conrelid = '"DesaDigital"'::regclass
  ) THEN
    ALTER TABLE "DesaDigital"
      ADD CONSTRAINT "DesaDigital_kategori_check" CHECK ("kategori" IN ('digital', 'tepat-guna'));
  END IF;
END $$;

-- 3) Daftar publik & admin selalu menyaring per kategori.
CREATE INDEX IF NOT EXISTS "DesaDigital_kategori_idx" ON "DesaDigital"("kategori");

-- 4) Salin isi Info Teknologi Tepat Guna (id dipertahankan supaya tautan/cadangan bisa dicocokkan, imageId ikut;
--    FileStorage-nya kini dirujuk dua tabel sehingga tidak terhapus selama cadangan masih ada).
--    id cuid praktis tak mungkin bentrok; bila bentrok dengan baris Desa Digital, baris itu DILEWATI (bukan
--    menimpa) dan NOTICE mencetak jumlahnya — datanya tetap utuh di "InfoTekno" untuk ditangani manual.
DO $$
DECLARE
  bentrok bigint;
BEGIN
  SELECT count(*) INTO bentrok
  FROM "InfoTekno" AS it
  JOIN "DesaDigital" AS dd ON dd."id" = it."id"
  WHERE dd."kategori" <> 'tepat-guna';
  IF bentrok > 0 THEN
    RAISE NOTICE '% baris "InfoTekno" tidak disalin: id-nya sudah dipakai baris Desa Digital. Data tetap ada di "InfoTekno"; salin manual dengan id baru.', bentrok;
  END IF;
END $$;

INSERT INTO "DesaDigital" ("id", "name", "deskripsi", "kategori", "imageId", "createdAt", "updatedAt", "deletedAt", "isActive")
SELECT it."id", it."name", it."deskripsi", 'tepat-guna', it."imageId", it."createdAt", it."updatedAt", it."deletedAt", it."isActive"
FROM "InfoTekno" AS it
ON CONFLICT ("id") DO NOTHING;

-- 5) Menu Access: submenu admin 'inovasi.info-teknologi-tepat-guna' dihapus (digabung ke ID yang dipertahankan
--    'inovasi.desa-digital-smart-village'). Pemilik akses lama diberi ID yang dipertahankan bila belum punya, lalu
--    baris lama dihapus. id baris baru deterministik dari id lama supaya run ulang tidak menggandakan.
INSERT INTO "UserMenuAccess" ("id", "userId", "menuId", "createdAt", "updatedAt")
SELECT 'inovtek_' || uma."id", uma."userId", 'inovasi.desa-digital-smart-village', now(), now()
FROM "UserMenuAccess" AS uma
WHERE uma."menuId" = 'inovasi.info-teknologi-tepat-guna'
ON CONFLICT DO NOTHING;

DELETE FROM "UserMenuAccess" WHERE "menuId" = 'inovasi.info-teknologi-tepat-guna';

-- 6) Visibilitas menu publik: MenuVisibility.menuKey = href submenu navbar. Dua href lama digabung jadi
--    '/inovasi/inovasi-teknologi-desa'. Href tanpa baris = tampil (default navbar), jadi gabungan disembunyikan hanya
--    bila KEDUA href lama disembunyikan admin; satu saja yang tampil → tampil. Setelan untuk href baru yang sudah ada
--    (disimpan setelah kode baru aktif) tidak ditimpa. Baris href lama lalu dihapus (tidak lagi dikenali aplikasi).
INSERT INTO "MenuVisibility" ("id", "menuKey", "isVisible", "updatedById", "createdAt", "updatedAt")
SELECT
  'inovtek_menu_visibility',
  '/inovasi/inovasi-teknologi-desa',
  count(*) < 2 OR bool_or(mv."isVisible"),
  (array_agg(mv."updatedById" ORDER BY mv."updatedAt" DESC))[1],
  now(),
  now()
FROM "MenuVisibility" AS mv
WHERE mv."menuKey" IN ('/inovasi/desa-digital-smart-village', '/inovasi/info-teknologi-tepat-guna')
HAVING count(*) > 0
ON CONFLICT DO NOTHING;

DELETE FROM "MenuVisibility"
WHERE "menuKey" IN ('/inovasi/desa-digital-smart-village', '/inovasi/info-teknologi-tepat-guna');
