/**
 * Saklar tunggal pesanan UMKM lewat website (dipakai halaman publik, API, dan test admin).
 *
 * `false` sejak 2026-11-12: tab admin Penjualan & Produk disembunyikan sementara
 * (`HIDDEN_UMKM_TABS` di `src/app/admin/(dashboard)/ekonomi/umkm/_lib/umkm-tabs.logic.ts`),
 * sehingga pesanan yang tercatat + stok yang berkurang tidak terpantau admin. Selama `false`,
 * halaman produk publik hanya menampilkan tombol "Hubungi Penjual (WhatsApp)" dan
 * `POST /api/ekonomi/umkm/penjualan/pesan` menolak request sebelum menyentuh DB.
 *
 * Sengaja konstanta kode, bukan env var: ini keputusan produk yang harus berubah bersamaan
 * dengan tab Penjualan (dikunci `__tests__/api/umkm_hubungi_penjual_wa.test.tsx`).
 * Cara menyalakan lagi: docs/debt/2026-11-12-umkm-tab-disembunyikan.md
 */
export const UMKM_PESANAN_TERCATAT: boolean = false;

/** Pesan penolakan endpoint pesanan selama `UMKM_PESANAN_TERCATAT` bernilai `false`. */
export const PESANAN_WEBSITE_NONAKTIF =
  'Pemesanan lewat website sedang dinonaktifkan. Silakan hubungi penjual lewat WhatsApp.';
