/**
 * SEMENTARA disembunyikan (permintaan user 2026-11-25): fitur ulasan produk UMKM belum diterapkan — belum ada model
 * ulasan, moderasi, maupun sumber rating (docs/BACKEND-TODO.md P3 "Rating produk UMKM tidak punya sumber data").
 * Saat false, halaman publik tidak merender: bagian "Ulasan" di detail produk (`UlasanSection`), tautan
 * "☆ Belum ada ulasan" ke #ulasan di kolom info detail produk, dan baris "☆ Belum ada ulasan" di kartu produk
 * (katalog, Produk serupa, detail toko). Kode & test komponen tidak dihapus; ubah ke true saat fitur ulasan siap,
 * lalu hapus konstanta ini.
 */
export const ULASAN_PRODUK_UMKM_TAMPIL = false;
