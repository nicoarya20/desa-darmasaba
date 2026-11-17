import type { PerpustakaanWebsite } from '@/lib/perpustakaan-website';

/** Body GET `/api/pendidikan/perpustakaandigital/pengaturan/find`. */
export type PerpusWebsiteBody = { success?: boolean; message?: string; data?: PerpustakaanWebsite | null } | null | undefined;

/** Keadaan halaman: memuat, siap (`data: null` = belum diatur admin), atau galat. */
export type PerpusWebsiteState =
  | { status: 'loading' }
  | { status: 'ready'; data: PerpustakaanWebsite | null }
  | { status: 'error' };

/** Baca respons GET pengaturan; HTTP ≠ 200 atau `success: false` → Error berkonteks. */
export function readPerpusWebsite(status: number, body: PerpusWebsiteBody): PerpustakaanWebsite | null {
  if (status !== 200 || !body?.success) {
    throw new Error(`Pengaturan perpustakaan gagal dimuat (HTTP ${status}): ${body?.message ?? 'tanpa pesan'}`);
  }
  return body.data ?? null;
}

/** Nama host untuk keterangan tombol (mis. "anantaloka.perpustakaan.co.id"); URL rusak → teks aslinya. */
export function websiteHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    // URL sudah divalidasi https di server; fallback ini hanya menjaga halaman tetap tampil bila data lama rusak.
    return url;
  }
}
