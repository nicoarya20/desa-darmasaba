// Pengaturan tampil/sembunyi harga produk UMKM di website publik (`UmkmConfig`) — murni, tanpa I/O.
// Dipakai bersama oleh endpoint (server), state admin, dan halaman katalog publik (klien).
import { z } from 'zod';

/** Bentuk pengaturan yang dikirim endpoint `/api/ekonomi/umkm/produk/pengaturan/find`. */
export type HargaPublik = { sembunyikanHarga: boolean };

/** Isian PUT admin. */
export const hargaPublikSchema = z.object({ sembunyikanHarga: z.boolean() });

/** Dari baris DB; belum ada baris aktif = harga tampil (perilaku sebelum saklar ada). */
export function toHargaPublik(row: { sembunyikanHarga: boolean } | null | undefined): HargaPublik {
  return { sembunyikanHarga: row?.sembunyikanHarga ?? false };
}
