/** Logika murni bersama halaman detail UMKM publik (detail produk & detail toko). */

/** Bentuk respons endpoint detail (`GET /api/ekonomi/umkm/:id`, `GET /api/ekonomi/umkm/produk/:id`). */
export type DetailResponse<T> = { success?: boolean; message?: string; data?: T | null } | null | undefined;

const NOT_FOUND_MESSAGE = /tidak ditemukan/i;

/**
 * Baca respons detail: data, `null` bila tidak ditemukan (handler membalas HTTP 200 + `success:false` + pesan
 * "... tidak ditemukan"), selain itu Error berkonteks `label` + `id` (galat server / respons tidak valid).
 */
export function readDetailResponse<T>(label: string, id: string, status: number, body: DetailResponse<T>): T | null {
  if (status !== 200) throw new Error(`${label} ${id} gagal (HTTP ${status}): ${body?.message ?? 'tanpa pesan'}`);
  if (body?.success === true && body.data) return body.data;
  if (body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? '')) return null;
  throw new Error(`${label} ${id} gagal: ${body?.message ?? 'respons tidak valid'}`);
}

/**
 * Baris belum dihapus dan tidak dinonaktifkan; kolom `isActive` kosong = aktif (bawaan schema).
 * Dipakai MITIGASI SEMENTARA(umkm-detail, umkm-detail-toko): endpoint detail mengirim data nonaktif/terhapus
 * (docs/BACKEND-TODO.md P2); pemakai menandai labelnya sendiri.
 */
export function isDataTampil(item: { deletedAt?: string | null; isActive?: boolean | null }): boolean {
  return item.deletedAt == null && item.isActive !== false;
}

/** Teks dipangkas; kosong/spasi → null. */
export function cleanText(s: string | null | undefined): string | null {
  const t = (s ?? '').trim();
  return t === '' ? null : t;
}

/** Inisial avatar/foto pengganti: huruf pertama dua kata pertama, huruf besar; kosong → "?". */
export function inisialNama(nama: string): string {
  const huruf = nama
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => Array.from(kata)[0] ?? '')
    .join('')
    .toLocaleUpperCase('id-ID');
  return huruf === '' ? '?' : huruf;
}
