import ApiFetch from '@/lib/api-fetch';
import type { PeminjamanPayload } from './peminjamanForm';

type CreateBody = { success?: boolean; message?: string } | null | undefined;

/**
 * Kirim permintaan pinjam buku (form publik, tanpa login). Tidak memakai `peminjamanBuku.create()` state admin:
 * fungsi itu memuat daftar SEMUA peminjam (nama/telp/alamat) ke browser warga setelah sukses.
 * Galat → Error berkonteks id buku saja; data pribadi peminjam tidak ikut ke pesan/log.
 */
export async function kirimPeminjaman(payload: PeminjamanPayload): Promise<void> {
  const res = await ApiFetch.api.pendidikan.perpustakaandigital.peminjamanbuku.create.post(payload);
  const body = (res.error ? res.error.value : res.data) as CreateBody;
  if (res.status !== 200 || body?.success !== true) {
    throw new Error(`Kirim peminjaman buku ${payload.bukuId} gagal (HTTP ${res.status})`);
  }
}
