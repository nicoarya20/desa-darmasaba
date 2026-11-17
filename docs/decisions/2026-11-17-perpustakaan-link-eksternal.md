# Perpustakaan Digital: halaman penghubung ke website perpustakaan desa (2026-11-17)

## Konteks

Desa Darmasaba sudah punya perpustakaan digital sendiri di luar website ini: **Pustaka Ananta Loka**
(`https://anantaloka.perpustakaan.co.id`, platform perpustakaan.co.id / "Digido Digital Ecosystem", footer bertanda
"© Pemerintah Desa Darmasaba"). Isinya ebook (±40 judul saat diperiksa), dibaca setelah pengunjung login di situs
tersebut, dengan stok per judul, ulasan, rak buku, berita, dan FAQ sendiri.

Website ini punya fitur yang fungsinya sama tapi tidak tersambung: katalog `DataPerpustakaan` + form pinjam publik
yang menyimpan `PeminjamanBuku` (nama, nomor telepon, alamat warga). Warga yang meminjam dari sini datanya tidak
pernah sampai ke sistem perpustakaan desa.

Hasil pengecekan situs (2026-11-17):

- `X-Frame-Options: SAMEORIGIN` → situsnya **tidak bisa** ditanam sebagai iframe.
- Tidak ada API publik; platform milik vendor → menarik katalognya ke website ini tidak layak (bergantung server
  pihak lain, dan membaca tetap harus login di situs mereka).

## Keputusan

Katalog dan form pinjam di website diganti **halaman penghubung** di URL yang sama, `/pendidikan/perpustakaan-digital`:
profil singkat (nama platform + deskripsi) dan satu tombol "Kunjungi Website Perpustakaan"
(`target="_blank" rel="noopener noreferrer"`, dengan keterangan host yang dibuka).

- **Pengaturan di DB, bukan hardcode**: model `PerpustakaanConfig` (satu baris aktif, pola `BeasiswaConfig`) berisi
  `namaPlatform`, `deskripsi`, `websiteUrl`. Operator mengubah alamat tanpa deploy. Migration
  `20261117180000_perpustakaan_config` membuat tabel `IF NOT EXISTS` dan mengisi baris awal Ananta Loka hanya bila
  belum ada baris aktif, sehingga aman dijalankan ulang dan halaman publik langsung berisi di setiap lingkungan.
- **Kontrak endpoint**: `GET /api/pendidikan/perpustakaandigital/pengaturan/find` publik (dipakai halaman publik),
  `PUT .../pengaturan/update` wajib admin lewat `guardAdmin` (401 tanpa sesi, 403 role 5). Guard global `route.ts`
  hanya memastikan login, padahal nilai ini dirender sebagai tautan publik. Validasi (`src/lib/perpustakaan-website.ts`)
  dipakai bersama form admin dan server: URL wajib `https://`, punya host, tanpa kredensial `user:pass@`.
- **URL lama tetap sampai**: `next.config.ts` mengalihkan `/pendidikan/perpustakaan-digital/:path+` → halaman
  penghubung (permanen). Satu aturan menutup `/semua`, `/{kategori}`, dan `/{kategori}/{id}` sekaligus, jadi tautan
  yang sudah dibagikan warga dan terindeks Google tidak jadi 404.
- **Form pinjam publik dihentikan**: `/api/pendidikan/perpustakaandigital/peminjamanbuku/create` dibuang dari
  `PUBLIC_POST_PATHS`. Ini sekaligus menutup jalur anonim untuk XSS tersimpan lewat `catatan` yang tercatat di
  `docs/BACKEND-TODO.md` (penyerang tidak lagi bisa POST tanpa login).
- **Catatan peminjam dirender teks polos** di detail admin (`htmlToPlainText`, bukan `dangerouslySetInnerHTML`):
  data lama yang sudah tersimpan tetap tidak dipercaya.
- **Pencarian global & Jenna**: tipe `dataPerpustakaan` dibuang dari `_lib/search/findMany.ts` dan `searchUrl.tsx`
  (judul buku lama tidak lagi muncul di pencarian publik). Panduan statis Jenna tidak lagi menyebut form pinjam dan
  menautkan halaman penghubung.
- **Data lama disimpan sebagai arsip** (keputusan user): tabel `DataPerpustakaan`, `KategoriBuku`, `PeminjamanBuku`
  dan admin-nya tidak dihapus. Tab admin diberi label "Arsip …" + kotak keterangan bahwa isinya tidak tampil di
  website publik, supaya desa bisa memeriksa data peminjam lama sebelum memutuskan dihapus. Menu baru
  "Website Perpustakaan" jadi tab pertama.
- **ID Menu Access `pendidikan.perpustakaan-digital` tidak diubah** (kontrak `menu_access_ids.contract.test.ts`):
  ID itu tersimpan di tabel `UserMenuAccess`, jadi mengubahnya akan menghapus hak akses yang sudah diberikan ke user.
  Hanya `path`-nya yang pindah ke `/admin/pendidikan/perpustakaan-digital/website`, masih di bawah `basePath` yang sama.

## Alternatif yang ditolak

- **Iframe**: mustahil, situsnya mengirim `X-Frame-Options: SAMEORIGIN`.
- **Integrasi katalog (API)**: tidak ada API publik, platform milik vendor, dan membaca tetap butuh login di situs
  mereka — ketergantungan besar untuk manfaat kecil.
- **Menu langsung keluar ke situs mereka**: mematikan tautan lama, hasil pencarian, breadcrumb, dan arahan Jenna,
  padahal pekerjaannya hanya sedikit lebih singkat daripada halaman penghubung.

## Masih terbuka (fase 2)

- Hapus tabel arsip (`DataPerpustakaan`, `KategoriBuku`, `PeminjamanBuku`), seeder, API katalog/peminjaman, dan
  halaman admin-nya setelah desa memastikan data peminjam lama tidak dibutuhkan. Isinya data pribadi warga, jadi
  penghapusannya harus disengaja lewat migration tersendiri.
- Perlu dipastikan ke desa: apakah masih ada peminjaman buku **fisik**. Bila ada, form pinjam bisa dihidupkan ulang
  untuk koleksi fisik (butuh validasi server + rate limit lebih dulu, lihat `docs/BACKEND-TODO.md`).

## Test

- `__tests__/api/perpustakaan_website_api.test.ts` — validasi URL/panjang, GET publik, PUT admin (401/403/400).
- `__tests__/api/perpus_penghubung_ui.test.tsx` — tombol (`target`, `rel`, `aria-describedby`), keadaan muat/galat/kosong.
- `__tests__/api/perpus_penghubung_routes.test.ts` — redirect URL lama, navbar/pencarian/Jenna, `PUBLIC_POST_PATHS`,
  path menu admin, dan idempotensi migration.
