-- Website publik pindah dari /darmasaba/* ke root (route group src/app/(public)), sehingga href
-- submenu di src/con/navbar-list-menu.ts tidak lagi berprefix. MenuVisibility.menuKey = href
-- submenu; key lama berprefix tidak lagi dikenali aplikasi (diabaikan toOverrides) sehingga
-- override admin akan hilang diam-diam bila tidak dimigrasi. Data-only, schema tidak berubah.
-- Idempoten: setelah dijalankan tidak ada lagi key '/darmasaba/%', jadi run ulang tidak mengubah apa pun.

-- 1) Hindari bentrok unique: bila versi tanpa prefix sudah ada (disimpan setelah kode baru
--    aktif = keputusan admin terbaru), buang row lama berprefix.
DELETE FROM "MenuVisibility" AS legacy
WHERE legacy."menuKey" LIKE '/darmasaba/%'
  AND EXISTS (
    SELECT 1 FROM "MenuVisibility" AS cur
    WHERE cur."menuKey" = substring(legacy."menuKey" from 11)
  );

-- 2) Buang prefix: '/darmasaba/kesehatan/puskesmas' -> '/kesehatan/puskesmas'. Prefix
--    '/darmasaba' = 10 karakter, jadi hasil substring dari karakter ke-11 selalu diawali '/'.
UPDATE "MenuVisibility"
SET "menuKey" = substring("menuKey" from 11)
WHERE "menuKey" LIKE '/darmasaba/%';
