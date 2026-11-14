import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { formatHarga } from '../../umkm/_com/katalog/katalog-card.logic';
import { LOWONGAN_BASE_HREF } from './lowongan-filter.meta';

/** Gaji ringkas tanpa spasi dengan titik ribuan, mis. 2500000 → "Rp2.500.000" (format rupiah yang sama dengan harga katalog UMKM). */
export function formatGaji(gaji: number): string {
  return formatHarga(gaji);
}

/** Waktu tayang sebagai Date; 0/negatif (tanggal tak terbaca di adapter) atau di luar jangkauan Date → null. */
function tayangDate(ms: number): Date | null {
  if (!(ms > 0)) return null;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Tanggal tayang panjang zona WITA, mis. "3 November 2026"; waktu tak terbaca (`ms <= 0`) → null. */
export function formatTanggalTayang(ms: number): string | null {
  const date = tayangDate(ms);
  return date ? formatTanggal(date) : null;
}

/** Nilai `dateTime` (ISO 8601) untuk `<time>` tanggal tayang; waktu tak terbaca → null. */
export function tanggalTayangIso(ms: number): string | null {
  return tayangDate(ms)?.toISOString() ?? null;
}

/** Rute detail lowongan publik. */
export const lowonganHref = (id: string) => `${LOWONGAN_BASE_HREF}/${id}`;
