# Hutang: penghapusan berkas & Sampah (2026-11-12, dikoreksi 2026-11-13)

Konteks: `docs/decisions/2026-11-12-sampah.md`. Sejak koreksi 2026-11-13 Sampah hanya untuk 4 fitur koleksi; menu lain
menghapus berkas **permanen** lewat `removeStoredFile` (baris FileStorage → MinIO, setelah operasi DB, berkas yang masih
dirujuk dilewati). Poin lama tentang berkas yang "belum masuk Sampah" (`DELETE /api/img/:name` untuk objek tanpa baris
FileStorage, `/api/imgs` menampilkan gambar di Sampah) tidak relevan lagi dan dihapus dari daftar ini.

## 1. ~~Record dihapus, berkas dibiarkan aktif (yatim di pustaka file)~~ — SELESAI 2026-11-13
Delete & update 8 model berikut kini menghapus permanen berkas yang dilepas **setelah** operasi DB sukses lewat
`removeReleasedFiles(owner, sebelum, sesudah)` (`_lib/fileStorage/_lib/removeReleasedFiles.ts`, membungkus
`removeStoredFile`); relasi galeri/lampiran m2m dibaca sebelum delete: Pengumuman (gambar, galeri, lampiran),
ArtikelKesehatan, DataPerpustakaan, KegiatanDesa, MediaSosial & ProgramInovasi (logo + galeri), PrestasiDesa, SdgsDesa.
Kedelapan handler hapus memang hard delete. Record yang soft-delete (mis. UMKM, Unit Usaha BUMDes, Pegawai PPID) tetap
merujuk berkasnya — benar dibiarkan. Test: `__tests__/api/file_hapus_menu_sisa.test.ts`.

## 2. ~~Pembersihan "lazy" panel sampah DAK hanya menghapus baris~~ — SELESAI 2026-11-13
`GET /api/landingpage/desaantikorupsi/:id/sampah` menghapus dokumen kedaluwarsa programnya lewat jalur hapus permanen
yang sama dengan `purgeSampah` (`destroySafely(dokumenDakSampahSource, id)`: baris → FileStorage → MinIO, berkas yang
masih dirujuk dokumen lain dilewati), dipaging per 100 ID. Respons endpoint tidak berubah.

## 3. ~~Hapus permanen satu dokumen di panel sampah DAK hanya menghapus baris~~ — SELESAI 2026-11-13
`DELETE /api/landingpage/desaantikorupsi/sampah/:dokumenId` memakai `dokumenDakSampahSource.destroy` (jalur yang
dibungkus `destroySafely` pada purge: baris → FileStorage → MinIO, berkas yang masih dirujuk dilewati). Dipanggil
langsung, bukan lewat `destroySafely`, agar error DB tetap menjadi 500 dan tidak tersamar sebagai 404. Respons & 404 tetap.

## 4. ~~Galeri Berita & Kesejahteraan Masyarakat tidak ikut terhapus~~ — SELESAI 2026-11-13
`desa/berita/{del,updt}.ts` dan `ekonomi/kesejahteraan-masyarakat/{del,updt}.ts` memakai `removeReleasedFiles` +
`fileIds` (gambar utama + galeri m2m): delete → semua dihapus permanen, update → yang dilepas saja, keduanya setelah
operasi DB sukses. Audit relasi m2m implisit ke FileStorage (`BeritaImages`, `KesejahteraanImages`, `PengumumanImages`,
`PengumumanDokumen`, `ProgramInovasiImages`) — kelimanya tercakup. Test: `__tests__/api/file_hapus_galeri.test.ts`,
`__tests__/api/berita_hapus_berkas_permanen.test.ts`.

## 5. Rujukan berkas non-FK tidak terdeteksi
URL gambar yang ditempel di isi rich text (berita, dst.) bukan FK sehingga `isFileReferenced` tidak melihatnya; berkas
yang dilepas record lain bisa terhapus walau masih tampil di isi tersebut. Sama seperti perilaku sebelum Sampah.
