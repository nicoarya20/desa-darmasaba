// Daftar tab admin UMKM + tab yang sedang disembunyikan. Fungsi murni — dipakai
// `layoutTabs.tsx` dan dites tanpa DOM.

/** Nilai tab admin UMKM (segmen URL setelah `/admin/ekonomi/umkm/`). */
export type UmkmTabValue = 'dashboard' | 'data-umkm' | 'produk' | 'penjualan' | 'kategori-produk';

/** Satu tab admin UMKM: label, nilai, dan tujuan navigasinya. */
export type UmkmTab = { label: string; value: UmkmTabValue; href: string };

/** Semua tab admin UMKM sesuai urutan tampil. Halaman tiap tab tetap ada walau disembunyikan. */
export const UMKM_TABS: readonly UmkmTab[] = [
  { label: 'Dashboard', value: 'dashboard', href: '/admin/ekonomi/umkm/dashboard' },
  { label: 'Data UMKM', value: 'data-umkm', href: '/admin/ekonomi/umkm/data-umkm' },
  { label: 'Produk', value: 'produk', href: '/admin/ekonomi/umkm/produk' },
  { label: 'Penjualan', value: 'penjualan', href: '/admin/ekonomi/umkm/penjualan' },
  { label: 'Kategori Produk', value: 'kategori-produk', href: '/admin/ekonomi/umkm/kategori-produk' },
];

/**
 * Tab yang DISEMBUNYIKAN (bukan dihapus) sejak 2026-11-12 atas permintaan desa, sementara.
 * Halaman, state, dan API-nya tetap aktif; hanya tombol tab & menu sidebar yang tak tampil.
 * Menampilkan/menyembunyikan 'penjualan' WAJIB bersamaan dengan saklar `UMKM_PESANAN_TERCATAT`
 * (src/lib/umkm-pesanan.ts) — dikunci __tests__/api/umkm_hubungi_penjual_wa.test.tsx.
 * Cara memunculkan lagi: docs/debt/2026-11-12-umkm-tab-disembunyikan.md
 */
export const HIDDEN_UMKM_TABS: readonly UmkmTabValue[] = ['dashboard', 'produk', 'penjualan', 'kategori-produk'];

/** Tab yang ditampilkan = semua tab kecuali yang ada di daftar tersembunyi. */
export function visibleUmkmTabs(
  tabs: readonly UmkmTab[] = UMKM_TABS,
  hidden: readonly UmkmTabValue[] = HIDDEN_UMKM_TABS,
): UmkmTab[] {
  return tabs.filter((tab) => !hidden.includes(tab.value));
}

/** Bar tab hanya berguna bila ada lebih dari satu tab untuk dipilih. */
export function shouldShowUmkmTabBar(tabs: readonly UmkmTab[]): boolean {
  return tabs.length > 1;
}
