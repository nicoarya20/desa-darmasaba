# Hutang: penghapusan berkas yang belum lewat Sampah (2026-11-12)

Konteks: `docs/decisions/2026-11-12-sampah.md`. Semua handler yang dulu menghapus berkas langsung sudah dialihkan ke
`removeStoredFile` (pindah ke Sampah). Sisa di bawah ini **belum** tercakup.

## 1. ~~Record dihapus, berkas dibiarkan aktif (yatim di pustaka file)~~ — SELESAI 2026-11-13
Delete & update 8 model berikut kini memindahkan berkas yang dilepas ke Sampah **setelah** operasi DB sukses lewat
`removeReleasedFiles(owner, sebelum, sesudah)` (`_lib/fileStorage/_lib/removeReleasedFiles.ts`, membungkus
`removeStoredFile`); relasi galeri/lampiran m2m dibaca sebelum delete. Asal = `FILE_OWNER_MENU`:
Pengumuman (gambar, galeri, lampiran) → `desa.pengumuman`, ArtikelKesehatan → `kesehatan.data-kesehatan-warga`,
DataPerpustakaan → `pendidikan.perpustakaan-digital`, KegiatanDesa → `lingkungan.gotong-royong`,
MediaSosial & ProgramInovasi (logo + galeri) → `landing-page.profil`, PrestasiDesa → `landing-page.prestasi-desa`,
SdgsDesa → `landing-page.sdgs`. Kedelapan handler hapus memang hard delete (bukan soft delete). Record yang
soft-delete (mis. UMKM, Unit Usaha BUMDes, Pegawai PPID) tetap merujuk berkasnya — benar dibiarkan aktif.
Test: `__tests__/api/sampah_menu_sisa.test.ts`.

## 2. `DELETE /api/img/:name` untuk objek tanpa baris FileStorage
`_lib/img-del.ts`: gambar yang tercatat di FileStorage masuk Sampah; objek MinIO lama (unggahan `upl-img` sebelum
FileStorage) tidak punya baris sehingga tidak bisa masuk Sampah dan **tetap dihapus permanen langsung**. Tidak ada
klien admin yang memanggil endpoint ini saat ini.

## 3. `/api/imgs` (daftar objek MinIO, admin) masih menampilkan gambar di Sampah
Endpoint membaca listing MinIO langsung, bukan FileStorage. Tidak dipakai UI admin saat ini (pustaka file memakai
`fileStorage/findMany` yang sudah mengecualikan Sampah).

## 4. ~~Pembersihan "lazy" panel sampah DAK hanya menghapus baris~~ — SELESAI 2026-11-13
`GET /api/landingpage/desaantikorupsi/:id/sampah` kini menghapus dokumen kedaluwarsa programnya lewat jalur hapus
permanen yang sama dengan `purgeSampah` (`destroySafely(dokumenDakSampahSource, id)`: baris → FileStorage → MinIO,
berkas yang masih dirujuk dokumen lain dilewati), dipaging per 100 ID. Respons endpoint tidak berubah.

## 5. ~~Hapus permanen satu dokumen di panel sampah DAK hanya menghapus baris~~ — SELESAI 2026-11-13
`DELETE /api/landingpage/desaantikorupsi/sampah/:dokumenId` kini memakai `dokumenDakSampahSource.destroy` (jalur yang
dibungkus `destroySafely` pada purge global: baris → FileStorage → MinIO, berkas yang masih dirujuk dilewati). Dipanggil
langsung, bukan lewat `destroySafely`, agar error DB tetap menjadi 500 dan tidak tersamar sebagai 404. Respons & 404 tetap.

## 6. ~~Galeri Berita & Kesejahteraan Masyarakat tidak ikut ke Sampah~~ — SELESAI 2026-11-13
`desa/berita/{del,updt}.ts` dan `ekonomi/kesejahteraan-masyarakat/{del,updt}.ts` memakai `removeReleasedFiles` +
`fileIds` (gambar utama + galeri m2m): delete → semua ke Sampah, update → yang dilepas saja, keduanya setelah operasi
DB sukses. Audit relasi m2m implisit ke FileStorage (`BeritaImages`, `KesejahteraanImages`, `PengumumanImages`,
`PengumumanDokumen`, `ProgramInovasiImages`) — kelimanya kini tercakup; tidak ada relasi galeri/dokumen m2m lain.
Test: `__tests__/api/sampah_galeri.test.ts`.
