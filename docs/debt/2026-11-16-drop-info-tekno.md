# Hutang: tabel `InfoTekno` masih ada sebagai cadangan (2026-11-16)

## Kenapa belum di-drop
Info Teknologi Tepat Guna digabung ke Inovasi Teknologi Desa (`docs/decisions/2026-11-16-inovasi-teknologi-desa.md`).
Migrasi `20261116120000_inovasi_teknologi_desa` **menyalin** baris `InfoTekno` ke tabel `"DesaDigital"` (kategori
`tepat-guna`) tanpa menghapus sumbernya, supaya data bisa dibandingkan/dipulihkan bila penyalinan di prod bermasalah.

Model `InfoTekno` di `prisma/schema.prisma` sengaja dipertahankan (tidak dipakai kode mana pun) agar schema selaras
dengan DB.

## Efek samping selama cadangan ada
- Gambar entri tepat guna dirujuk dua tabel (`InfoTekno.imageId` & `"DesaDigital".imageId`). Menghapus/mengganti
  gambar entri gabungan tidak menghapus berkasnya (`removeStoredFile` melihat masih dirujuk `InfoTekno`) — berkas
  tetap di MinIO sampai cadangan dihapus.
- Perubahan admin setelah migrasi hanya ada di tabel gabungan; `InfoTekno` membeku pada isi saat migrasi.

## Cara melunasi (setelah prod terverifikasi)
1. Cocokkan di prod: setiap `id` di `InfoTekno` ada di `"DesaDigital"` dengan `kategori = 'tepat-guna'` (atau NOTICE
   bentrok id saat migrasi sudah ditangani manual).
2. Hapus model `InfoTekno` + relasi `InfoTekno InfoTekno[]` di `FileStorage` dari schema, buat migrasi
   `DROP TABLE IF EXISTS "InfoTekno";` (guard idempoten, komentar kenapa).
3. Setelah DROP, berkas yang hanya dirujuk `InfoTekno` (entri yang sudah dihapus/diganti gambarnya di menu gabungan)
   menjadi yatim di `FileStorage`/MinIO — bersihkan bila perlu.
4. Hapus file hutang ini.
