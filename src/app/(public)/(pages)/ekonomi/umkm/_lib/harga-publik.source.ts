import ApiFetch from '@/lib/api-fetch';

/**
 * Saklar admin "Sembunyikan harga" (tab Produk) untuk halaman UMKM publik. Bila harga disembunyikan, source
 * mengosongkan `harga` (null) sebelum data sampai ke komponen, jadi komponen cukup memeriksa `harga !== null`.
 */

type PengaturanBody = { success?: boolean; data?: { sembunyikanHarga?: unknown } | null } | null | undefined;

/** Harga boleh tampil? `null` bila respons tidak bisa dibaca (galat server / bentuk tak dikenal). */
export function hargaTampilDari(status: number, body: PengaturanBody): boolean | null {
  const nilai = body?.data?.sembunyikanHarga;
  if (status !== 200 || body?.success !== true || typeof nilai !== 'boolean') return null;
  return !nilai;
}

/**
 * Muat saklar harga. Fail-closed: bila gagal dimuat, harga DISEMBUNYIKAN (keinginan desa saat saklar dibuat,
 * 2026-11-25) dan galat dicatat; katalog tetap tampil tanpa harga daripada gagal seluruhnya.
 */
export async function loadHargaTampil(): Promise<boolean> {
  try {
    const res = await ApiFetch.api.ekonomi.umkm.produk.pengaturan.find.get();
    const tampil = hargaTampilDari(res.status, res.data as PengaturanBody);
    if (tampil === null) console.error(`Pengaturan harga UMKM tidak terbaca (HTTP ${res.status}); harga disembunyikan.`);
    return tampil ?? false;
  } catch (e) {
    console.error('Gagal memuat pengaturan harga UMKM; harga disembunyikan:', e);
    return false;
  }
}

/** Kosongkan harga bila tidak boleh tampil (termasuk teks "Harga menyesuaikan"). */
export function terapkanHarga<T extends { harga: number | null; hargaMenyesuaikan?: boolean }>(item: T, hargaTampil: boolean): T {
  return hargaTampil ? item : { ...item, harga: null, hargaMenyesuaikan: false };
}
