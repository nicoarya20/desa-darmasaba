# Arah Kebijakan Pembangunan Desa (Batch 2 Lomba, `feature/lomba-batch-2-arah`)

## Ringkasan
Halaman publik baru `/pemerintahan/arah-kebijakan-pembangunan-desa` menampilkan dokumen perencanaan & penganggaran
dalam 4 kategori (RPJM Desa, RKPDes, APBDes, Pelaporan) plus tab Berita Acara yang hanya muncul bila ada minimal satu
dokumen aktif. Data memakai tabel/API `DokumenPerencanaan` yang sudah ada; APBDes dan Pelaporan adalah dua nilai `jenis`
baru (`APBDES`, `PELAPORAN_APBDES`). Tanpa migrasi, tanpa perubahan schema.

## Perubahan
- `src/lib/dokumen-perencanaan.ts`: 5 jenis, label baru, `APBDES`/`PELAPORAN_APBDES` memakai `tahun` seperti RKP;
  `DOKUMEN_PERENCANAAN_PUBLIC_HREF` kini `/pemerintahan/arah-kebijakan-pembangunan-desa` (nama ekspor tetap);
  `DOKUMEN_PERENCANAAN_SECTION_ID` dihapus (anchor Monev sudah tidak ada).
- API `desa/dokumen-perencanaan`: POST/PUT/DELETE kini lewat `guardAdmin` (role 0-4) sebagai `beforeHandle` di `index.ts`
  (`dokumen-perencanaan.guard.ts`); handler tidak berubah, GET tetap publik. Kontrak aditif.
- Admin: judul "Arah Kebijakan Pembangunan Desa", dropdown/filter 5 jenis, placeholder & petunjuk per jenis
  (`_com/dokumen-perencanaan.text.ts`), judul form tambah/ubah.
- Publik baru: `page.tsx` + `_com/` (`ArahKebijakanPage` memuat data, `ArahKebijakanView` tampilan murni, `DokumenTabel`,
  `arah-kebijakan.{logic,source,text,meta}.ts`, `use-dokumen-kategori.ts`, `.module.css`). Tabel No / Nama Dokumen / Tahun /
  File / Aksi (Lihat tab baru + Unduh `download`), mobile jadi kartu bertumpuk, urut tahun menurun, paginasi 10/halaman.
- Monev: section & baris dokumen dihapus, diganti kartu tautan (`MonevLinkCard` generik + `MonevApbdesLink` + `MonevArahLink`);
  label "Bersumber dari RKP Desa {tahun}" tetap (state `dokumenPerencanaanPublik` dipangkas jadi `rkpDocs` + `loadRkpIndex`).
- PPID Daftar Informasi Publik: kalimat catatan diperbarui ke halaman baru (label tautan tetap "Dokumen Perencanaan").

## Keputusan
- Tab publik memakai istilah desa "RKPDes"; label lib/admin tetap "RKP Desa" (dipakai "Bersumber dari RKP Desa" dan test lama).
- Probe Berita Acara = satu request `limit=1`; bila gagal tab disembunyikan (galat dilog), empat kategori utama tetap jalan.
- Guard dipasang di route (`beforeHandle`), bukan di handler, agar test handler lama tetap hijau.
- Urutan tahun menurun dijamin di klien (RPJM memakai tahun mulai) di atas urutan API.

## Test
`arah_kebijakan_{logic,ui}`, `dokumen_perencanaan_{jenis_baru,admin_guard,admin_ui}`, ubahan kecil
`dokumen_perencanaan` (pesan jenis asing) dan `monev_page_ui` (bagian dokumen diganti kartu tautan).

## Temuan di luar scope
- Komentar `jenis` di `prisma/schema.prisma` masih menyebut 3 nilai; `docs/DESIGN.md` bagian Monev & `docs/BACKEND-TODO.md`
  (butir mutasi Dokumen Perencanaan, butir navbar) perlu dikonsolidasi coordinator.
- `__tests__/api/dokumen_perencanaan_menu.test.tsx` menegaskan nama menu admin 'Dokumen Perencanaan'; ikut berubah saat
  coordinator mengganti label di `domains.ts`.
- State admin `delete.byId` memuat ulang daftar tanpa filter jenis/pencarian yang sedang aktif (sudah ada sebelumnya).
- Tautan lama `/pemerintahan/monev-pembangunan#dokumen-perencanaan` kini hanya membuka puncak halaman Monev.
