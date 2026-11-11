// Ringkasan kartu folder halaman program publik Desa Anti Korupsi: cuplikan judul dokumen + sisa,
// dan tanggal dokumen terbaru di folder.
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { formatTanggalUnggah } from './dokumen-info';

/** Jumlah judul dokumen yang dicuplik di kartu folder. */
export const CUPLIKAN_MAX = 2;

/** Cuplikan kartu: judul dokumen pertama (urutan asli) + jumlah dokumen yang tidak ditampilkan. */
export type CuplikanJudul = { judul: string[]; sisa: number };

/** Ambil `max` judul dokumen pertama dan hitung sisanya ("+N lainnya"). */
export function cuplikanJudul(dokumen: readonly DokumenDesaAntiKorupsiView[], max = CUPLIKAN_MAX): CuplikanJudul {
  const judul = dokumen.slice(0, Math.max(0, max)).map((d) => d.judul);
  return { judul, sisa: dokumen.length - judul.length };
}

/**
 * Tanggal dokumen terbaru di folder (dari `createdAt` = tanggal unggah; view tidak membawa `updatedAt`),
 * format ringkas id-ID WITA. Folder kosong / tanpa tanggal valid → null.
 */
export function tanggalTerakhir(dokumen: readonly DokumenDesaAntiKorupsiView[]): string | null {
  let terbaru = -Infinity;
  for (const d of dokumen) {
    const time = Date.parse(d.createdAt);
    if (time > terbaru) terbaru = time;
  }
  return Number.isFinite(terbaru) ? formatTanggalUnggah(new Date(terbaru).toISOString()) : null;
}
