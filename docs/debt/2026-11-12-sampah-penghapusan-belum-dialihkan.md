# Hutang: penghapusan berkas yang belum lewat Sampah (2026-11-12)

Konteks: `docs/decisions/2026-11-12-sampah.md`. Semua handler yang dulu menghapus berkas langsung sudah dialihkan ke
`removeStoredFile` (pindah ke Sampah). Sisa di bawah ini **belum** tercakup.

## 1. Record dihapus, berkas dibiarkan aktif (yatim di pustaka file)
Handler berikut menghapus record yang punya relasi FileStorage tanpa menyentuh berkasnya (perilaku lama, tidak
diubah karena di luar "penghapusan langsung"). Berkasnya tetap aktif & tampil di pustaka file, tidak masuk Sampah:

| Model | Handler (`src/app/api/[[...slugs]]/_lib/…`) |
|---|---|
| Pengumuman (gambar, galeri, lampiran) | `desa/pengumuman/del.ts` |
| ArtikelKesehatan | `kesehatan/data_kesehatan_warga/artikel_kesehatan/del.ts` |
| DataPerpustakaan | `pendidikan/perpustakaan-digital/data-perpustakaan/del.ts` |
| KegiatanDesa | `lingkungan/gotong-royong/del.ts` |
| MediaSosial | `landing_page/profile/media-sosial/del.ts` |
| PrestasiDesa | `landing_page/prestasi-desa/del.ts` |
| ProgramInovasi | `landing_page/profile/program-inovasi/del.ts` |
| SdgsDesa | `landing_page/sdgs-desa/del.ts` |

Cara menutup: setelah `prisma.<model>.delete` sukses, panggil `removeStoredFile(<relasi>, "<Model>")` per berkas dan
tambahkan `<Model>: "<menuId>"` ke `FILE_OWNER_MENU`. Record yang soft-delete (mis. UMKM, Unit Usaha BUMDes, Pegawai
PPID) tetap merujuk berkasnya — benar dibiarkan aktif.

## 2. `DELETE /api/img/:name` untuk objek tanpa baris FileStorage
`_lib/img-del.ts`: gambar yang tercatat di FileStorage masuk Sampah; objek MinIO lama (unggahan `upl-img` sebelum
FileStorage) tidak punya baris sehingga tidak bisa masuk Sampah dan **tetap dihapus permanen langsung**. Tidak ada
klien admin yang memanggil endpoint ini saat ini.

## 3. `/api/imgs` (daftar objek MinIO, admin) masih menampilkan gambar di Sampah
Endpoint membaca listing MinIO langsung, bukan FileStorage. Tidak dipakai UI admin saat ini (pustaka file memakai
`fileStorage/findMany` yang sudah mengecualikan Sampah).

## 4. Pembersihan "lazy" panel sampah DAK hanya menghapus baris
`GET /api/landingpage/desaantikorupsi/:id/sampah` menghapus permanen dokumen DAK kedaluwarsa tanpa menyentuh
FileStorage/MinIO (perilaku lama). Berkasnya jadi aktif-yatim bila tidak dipakai dokumen lain. Purge global
(`purgeSampah`) menangani DAK lengkap (baris + berkas) bila berjalan lebih dulu.
