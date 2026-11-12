# Hutang: tab admin UMKM disembunyikan sementara (2026-11-12)

## Apa yang disembunyikan & kenapa

Atas permintaan desa, **untuk sementara** admin UMKM hanya menampilkan tab **Data UMKM**.
Tab **Dashboard**, **Produk**, **Penjualan**, dan **Kategori Produk** **disembunyikan, bukan
dihapus**:

- Halaman (`src/app/admin/(dashboard)/ekonomi/umkm/{dashboard,produk,penjualan,kategori-produk}`),
  state Valtio (`src/app/admin/(dashboard)/_state/ekonomi/umkm/`), dan API
  (`src/app/api/[[...slugs]]/_lib/ekonomi/umkm/`) tetap ada dan tidak diubah.
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
4. Bila semua tab sudah tampil kembali, hapus komentar hutang di `HIDDEN_UMKM_TABS` dan file ini.

## Risiko terbuka (keputusan belum diambil user)

Halaman publik produk UMKM **masih aktif**: warga bisa membuka `/ekonomi/umkm/produk/:id`
dan mengirim pesanan lewat form pesanan → `POST /api/ekonomi/umkm/penjualan/pesan`
(ada di whitelist `PUBLIC_POST_PATHS`, `src/lib/auth-policy.ts`). Pesanan tetap tercatat
di tabel penjualan dan mengurangi stok, tetapi **tidak ada admin yang melihatnya** karena
tab Penjualan (dan Produk untuk mengelola stok) disembunyikan.

Opsi mitigasi — **belum diputuskan user**, jangan dieksekusi tanpa persetujuan:

- **A. Pengaturan → Visibilitas Menu** (`/admin/pengaturan/visibilitas-menu`): sembunyikan
  submenu publik UMKM (menuKey `/ekonomi/umkm`). Tanpa kode, bisa dibalik kapan saja. Efek:
  seluruh halaman publik UMKM (daftar UMKM + detail produk) ikut tersembunyi, bukan hanya form
  pesanan. Catatan: guard ini di sisi UI — endpoint `POST .../penjualan/pesan` masih menerima
  request langsung.
- **B. Biarkan apa adanya**: halaman publik tetap tampil; pesanan masuk dan menumpuk sampai
  tab Penjualan dimunculkan lagi (data tidak hilang, hanya tidak dipantau).
- **C. Ubah kode publik** (mis. sembunyikan form pesanan saja / tutup endpoint) — di luar
  scope perubahan ini karena tampilan publik sengaja tidak disentuh.
