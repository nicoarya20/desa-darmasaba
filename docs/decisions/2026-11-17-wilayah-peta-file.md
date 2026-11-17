# Wilayah Desa: file peta (gambar/PDF) di atas peta embed

Tanggal: 2026-11-17 · Migrasi: `20261117173000_wilayah_peta_file`

## Konteks
Section "Letak & Batas Wilayah" di Profil Desa hanya bisa menampilkan peta embed (`petaEmbedUrl`, Google Maps).
Desa punya peta wilayah resmi berupa gambar/scan PDF yang tidak bisa di-embed. Admin perlu mengunggah satu file peta
dari form Pemerintahan > Profil > Letak & Batas Wilayah.

## Keputusan
- **Relasi FileStorage opsional**: `WilayahDesa.petaFileId String?` + relasi `petaFile` (`"WilayahDesaPetaFile"`),
  FK `ON DELETE SET NULL`. Migrasi additive (kolom nullable + FK), idempoten.
- **Jenis file**: gambar JPG/PNG/WebP atau PDF (`PETA_FILE_MIME_GAMBAR`, `PETA_FILE_MIME_PDF` di
  `src/lib/wilayah-desa.ts`). Endpoint upload mengonversi gambar ke WebP dan menyimpan PDF apa adanya; jenis lain
  disimpan ter-gzip sehingga ditolak API. Batas ukuran di form mengikuti dropzone lain: gambar 5 MB
  (`GAMBAR_MAX_BYTES`), PDF 10 MB (`DOKUMEN_PDF_MAX_BYTES`).
- **Upload saat Simpan** (pola Pengumuman) lewat `POST /api/fileStorage/create`; Batal mengembalikan file tersimpan
  tanpa meninggalkan berkas. Bila upload sukses tapi simpan gagal, percobaan Simpan berikutnya memakai id yang sudah
  terunggah (tidak upload ulang); bila lalu dibatalkan, berkas itu tertinggal (sama seperti Pengumuman).
- **File lama** (diganti/dihapus) dihapus permanen lewat `removeReleasedFiles` setelah upsert sukses; berkas yang
  masih dirujuk data lain dibiarkan (FK baru otomatis terdeteksi, lihat `docs/decisions/2026-11-12-sampah.md`).
- **Tampilan publik**: bila ada file dan embed, keduanya tampil — file dulu, lalu peta embed (tidak berubah). Gambar =
  `<figure>` (alt "Peta wilayah Desa Darmasaba", lazy, klik = ukuran penuh di tab baru); PDF = tombol
  "Lihat peta wilayah (PDF)" + ukuran yang membuka `PengumumanPdfModal`. Embed kosong → peta Kantor Perbekel tetap.
- **Reuse tanpa ekstraksi**: `PENGUMUMAN_FILE_SELECT`/`PengumumanFile` (alias `WilayahPetaFile`), `PengumumanPdfModal`,
  `unggahGambar`, `formatUkuran` dan konstanta ukuran diimpor apa adanya dari domain asalnya.

## Kontrak `/api/desa/profile/wilayah` (additive)
`File` = `{ id, link, realName, mimeType, size }`.

| Method | Path | Perubahan |
|---|---|---|
| PUT | `/` (upsert) | opsional `petaFileId?: string \| null`. **Tidak dikirim = tidak diubah**; `null`/`""` = hapus; string = set (di-trim). 400 `{ success: false, message }` bila bukan teks ("File peta tidak valid"), file tidak ada/tidak aktif ("File peta tidak ditemukan atau sudah dihapus") atau bukan gambar/PDF. Respons `data` membawa `petaFileId` + `petaFile`. |
| GET | `/` | tambah `petaFileId: string \| null`, `petaFile: File \| null`. |

## Di luar lingkup
Lebih dari satu file peta, keterangan per file, dan pembersihan berkas yatim akibat simpan gagal setelah upload.
