# Hutang: tab admin UMKM disembunyikan sementara (2026-11-12)

## Apa yang disembunyikan & kenapa

Atas permintaan desa, **untuk sementara** admin UMKM hanya menampilkan tab **Data UMKM**.
Tab **Dashboard**, **Produk**, **Penjualan**, dan **Kategori Produk** **disembunyikan, bukan
dihapus**:

- Halaman (`src/app/admin/(dashboard)/ekonomi/umkm/{dashboard,produk,penjualan,kategori-produk}`),
  state Valtio (`src/app/admin/(dashboard)/_state/ekonomi/umkm/`), dan API
  (`src/app/api/[[...slugs]]/_lib/ekonomi/umkm/`) tetap ada dan tidak diubah — kecuali
  `POST .../penjualan/pesan` publik yang ditolak selama saklar pesanan mati (lihat di bawah).
- Halaman tersebut masih bisa dibuka lewat URL langsung — yang hilang hanya tombol tab
  dan entry point menu.
- Karena tinggal satu tab, bar tab (desktop & mobile) tidak dirender; layout hanya
  menampilkan judul "Manajemen UMKM" + konten.

## File / konstanta yang mengatur

| Lokasi | Isi |
|--------|-----|
| `src/app/admin/(dashboard)/ekonomi/umkm/_lib/umkm-tabs.logic.ts` | `UMKM_TABS` (semua tab), `HIDDEN_UMKM_TABS` (tab yang disembunyikan), `visibleUmkmTabs()`, `shouldShowUmkmTabBar()` |
| `src/app/admin/(dashboard)/ekonomi/umkm/_lib/layoutTabs.tsx` | Merender bar tab hanya bila `shouldShowUmkmTabBar()` true |
| `src/app/admin/_com/nav/domains.ts` (entri `ekonomi.umkm`) | `path` sidebar diarahkan ke `/admin/ekonomi/umkm/data-umkm` (semula `/dashboard`); `id` & `basePath` tidak berubah |
| `__tests__/api/umkm_tab_disembunyikan.test.tsx` | Mengunci perilaku di atas |
| `src/lib/umkm-pesanan.ts` | `UMKM_PESANAN_TERCATAT` (saklar pesanan website, saat ini `false`) — lihat bagian risiko di bawah |
| `__tests__/api/umkm_hubungi_penjual_wa.test.tsx` | Mengunci saklar ↔ tab `penjualan` dan tombol WhatsApp di halaman produk publik |

## Cara memunculkan lagi

1. Di `umkm-tabs.logic.ts`, hapus value tab yang ingin dimunculkan dari `HIDDEN_UMKM_TABS`
   (kosongkan array untuk memunculkan semua). Bar tab otomatis muncul lagi begitu tab
   tampil > 1.
2. Bila Dashboard dimunculkan lagi dan ingin jadi halaman pertama, kembalikan `path` entri
   `ekonomi.umkm` di `domains.ts` ke `/admin/ekonomi/umkm/dashboard` (jangan ubah `id` /
   `basePath` — dikunci `__tests__/api/menu_access_ids.contract.test.ts`), lalu hapus komentar
   pointer di atas entri tersebut.
3. Sesuaikan `__tests__/api/umkm_tab_disembunyikan.test.tsx` (ekspektasi daftar tersembunyi,
   tab tampil, label yang tidak dirender, dan `path` sidebar).
4. **Tab Penjualan & saklar pesanan diubah bersamaan.** Saat `penjualan` dihapus dari
   `HIDDEN_UMKM_TABS`, ubah `UMKM_PESANAN_TERCATAT` di `src/lib/umkm-pesanan.ts` menjadi `true`
   (dan sebaliknya). Test `umkm_hubungi_penjual_wa.test.tsx` gagal bila keduanya tidak selaras.
   Sebaiknya tab Produk ikut dimunculkan agar admin bisa mengisi ulang stok. Setelah itu sesuaikan
   test yang mengunci keadaan nonaktif (`umkm_hubungi_penjual_wa.test.tsx` blok SSR & "keadaan saat
   ini", serta test "saklar mati" di `umkm_pesanan_publik.test.ts`).
5. Bila semua tab sudah tampil kembali, hapus komentar hutang di `HIDDEN_UMKM_TABS` dan file ini.

## Risiko pesanan publik — DITUTUP (opsi C, 2026-11-12)

Sebelumnya halaman publik `/ekonomi/umkm/produk/:id` tetap menerima pesanan lewat
`POST /api/ekonomi/umkm/penjualan/pesan` (whitelist `PUBLIC_POST_PATHS`, `src/lib/auth-policy.ts`):
pesanan tercatat dan stok berkurang, padahal tidak ada admin yang melihatnya.

User memilih **opsi C**, diatur satu saklar `UMKM_PESANAN_TERCATAT = false`
(`src/lib/umkm-pesanan.ts`, konstanta kode — bukan env var):

- **Publik:** tombol "Pesan Sekarang" diganti **"Hubungi Penjual (WhatsApp)"** — tautan `wa.me`
  ke nomor penjual (dinormalisasi `normalizeWaNumber`) dengan pesan pembuka berisi nama produk.
  Tidak mencatat pesanan, tidak mengurangi stok. Nomor kosong/tidak valid → tombol disabled +
  penjelasan. `PesananModal` tidak dirender (kodenya tetap ada). Tombol toko online tetap.
- **Server:** handler `pesan.ts` menolak dengan **403** `{ success: false, message: "Pemesanan
  lewat website sedang dinonaktifkan. ..." }` sebelum menyentuh DB, sehingga request langsung
  ke endpoint juga tidak mencatat apa pun. Logika pencatatan (`_pesan.ts`) tidak dihapus.

Untuk menyalakan lagi: ikuti langkah 4 di "Cara memunculkan lagi".
