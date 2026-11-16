import { compareJenjang } from "@/lib/jenjang-pendidikan-urutan";
import { summarizeStatBars, type StatBarItem, type StatBarRow, type StatBarsSummary } from "@/app/(public)/_com/stat-bars/stat-bars.logic";

// parseJumlah & formatJumlah kini milik modul bersama stat-bars; diekspor ulang agar pemakai lama tetap jalan.
export { formatJumlah, parseJumlah } from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Satu kategori pendidikan yang sudah dinormalkan dari respons API. */
export type DataPendidikanItem = {
  id: string;
  nama: string;
  /** null = isian admin kosong atau bukan bilangan bulat (kolom `jumlah` di DB bertipe teks bebas). */
  jumlah: number | null;
  updatedAt: string | null;
};

type DataPendidikanStatItem = DataPendidikanItem & StatBarItem;

/** Baris siap tampil: porsi dari total (persen) dan panjang batang relatif ke jenjang terbanyak. */
export type DataPendidikanRow = StatBarRow<DataPendidikanStatItem>;

export type DataPendidikanSummary = StatBarsSummary<DataPendidikanStatItem>;

/** Urut jenjang baku (PAUD, TK, SD, SMP, SMA, SMK, lalu lainnya A–Z); nama sama tetap berurutan seperti dari API. */
export function sortByJenjang<T extends { nama: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => compareJenjang(a.nama, b.nama));
}

/** Total, persen porsi, panjang batang, dan waktu pembaruan terakhir. Baris ganda tidak digabung. */
export function summarizeDataPendidikan(items: readonly DataPendidikanItem[]): DataPendidikanSummary {
  return summarizeStatBars(sortByJenjang(items).map((item) => ({ ...item, label: item.nama, value: item.jumlah })));
}
