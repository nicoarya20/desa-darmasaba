-- Kontak resmi kantor desa (nama kantor, alamat, telepon, email) sebelumnya konstanta di kode (KONTAK_DESA), sehingga
-- mengubah nomor atau email harus lewat rilis. Dipindah ke CMS (Profil Desa > Kontak Desa) supaya admin bisa memperbaruinya
-- sendiri; footer publik dan halaman PPID membacanya dari tabel ini.
-- Murni aditif dan idempoten: hanya membuat tabel baru + satu baris awal; tidak menyentuh tabel/kolom lain. Singleton
-- (id tetap "kontak-desa"), jadi tidak butuh indeks tambahan.
-- Baris awal berisi nilai PERSIS konstanta lama (disalin dari src/con/kontak-desa.ts) agar footer tidak kosong setelah
-- deploy dan data yang sudah tampil di situs tidak hilang. ON CONFLICT DO NOTHING: bila admin sudah mengedit baris ini
-- (atau migrasi dijalankan ulang), isinya tidak ditimpa.

CREATE TABLE IF NOT EXISTS "KontakDesa" (
    "id" TEXT NOT NULL,
    "namaKantor" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KontakDesa_pkey" PRIMARY KEY ("id")
);

INSERT INTO "KontakDesa" ("id", "namaKantor", "alamat", "telepon", "email", "updatedAt")
VALUES (
    'kontak-desa',
    'Kantor Perbekel Desa Darmasaba',
    'Jl. Raya Darmasaba – Lukluk, Desa Darmasaba, Kec. Abiansemal, Kab. Badung, Bali 80352',
    '(0361) 8441518',
    'ddarmasaba@gmail.com',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
