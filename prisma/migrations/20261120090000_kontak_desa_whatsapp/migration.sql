-- Kenapa: admin perlu bisa mencantumkan nomor WhatsApp kantor desa di Kontak Desa (footer dan PPID), tetapi desa
-- belum memberikan nomornya. Kolom dibuat NULLABLE tanpa default dan tanpa baris awal: NULL = belum ada nomor, jadi
-- baris singleton yang sudah terisi tidak berubah dan tampilan publik tetap sama sampai admin mengisinya.
-- Murni aditif dan idempoten (IF NOT EXISTS): aman dijalankan ulang, tidak menyentuh kolom/tabel lain.

ALTER TABLE "KontakDesa" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
