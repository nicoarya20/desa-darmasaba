import { parseJumlah, type StatBarItem } from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Bentuk minimal item `/api/ekonomi/jumlahpendudukmiskin/find-many` (model GrafikJumlahPendudukMiskin). */
export type PendudukMiskinApiItem = {
  id: string;
  year: number | string;
  totalPoorPopulation: number | string;
  updatedAt?: string | null;
};

/** Satu tahun siap tampil; `jumlah` null = isian tak terbaca (ditulis "Belum diisi", tidak ditebak). */
export type PendudukMiskinTahun = {
  id: string;
  tahun: number;
  jumlah: number | null;
  updatedAt: string | null;
};

/** Perubahan tahun terbaru terhadap tahun sebelumnya yang tercatat (bukan selalu tahun kalender − 1). */
export type PerubahanTahun = { selisih: number; persen: number | null; dari: number };

const MIN_TAHUN = 1900;
const MAX_TAHUN = 2999;

/** Normalkan item API; tahun tak masuk akal → null (baris dibuang karena tak bisa diberi label). */
export function toPendudukMiskinTahun(item: PendudukMiskinApiItem): PendudukMiskinTahun | null {
  const tahun = Number(item.year);
  if (!Number.isInteger(tahun) || tahun < MIN_TAHUN || tahun > MAX_TAHUN) return null;
  return { id: item.id, tahun, jumlah: parseJumlah(item.totalPoorPopulation), updatedAt: item.updatedAt ?? null };
}

/** Tahun terbaru dulu (API mengirim urut naik). */
export function sortTahunDesc(rows: readonly PendudukMiskinTahun[]): PendudukMiskinTahun[] {
  return [...rows].sort((a, b) => b.tahun - a.tahun);
}

/** Tahun terbaru yang jumlahnya terisi; null bila tak ada. `rows` urut terbaru dulu. */
export function pickLatestTahun(rows: readonly PendudukMiskinTahun[]): PendudukMiskinTahun | null {
  return rows.find((row) => row.jumlah !== null) ?? null;
}

/**
 * Selisih `latest` terhadap tahun terisi sebelumnya (tahun lebih kecil terdekat). Persen null bila pembanding 0.
 * Tanpa pembanding → null.
 */
export function perubahanTahun(rows: readonly PendudukMiskinTahun[], latest: PendudukMiskinTahun): PerubahanTahun | null {
  if (latest.jumlah === null) return null;
  const dari = sortTahunDesc(rows).find((row) => row.tahun < latest.tahun && row.jumlah !== null);
  if (!dari || dari.jumlah === null) return null;
  const selisih = latest.jumlah - dari.jumlah;
  return { selisih, persen: dari.jumlah > 0 ? (selisih / dari.jumlah) * 100 : null, dari: dari.tahun };
}

/** Arah perubahan untuk ikon & kata (netral: tanpa warna merah/hijau). */
export function arahPerubahan(selisih: number): "naik" | "turun" | "tetap" {
  return selisih > 0 ? "naik" : selisih < 0 ? "turun" : "tetap";
}

/** Baris batang `stat-bars` (label = tahun), urutan masukan dipertahankan. */
export function toStatBarItems(rows: readonly PendudukMiskinTahun[]): StatBarItem[] {
  return rows.map((row) => ({ id: row.id, label: String(row.tahun), value: row.jumlah, updatedAt: row.updatedAt }));
}
