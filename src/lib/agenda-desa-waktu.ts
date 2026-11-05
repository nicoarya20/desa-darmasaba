// Aturan waktu Agenda & Kalender Desa — murni & deterministik. Desa Darmasaba
// berzona WITA (UTC+8, tanpa DST), jadi batas hari/bulan/tahun dihitung di WITA
// agar server (UTC) dan browser memberi hasil yang sama.

export const AGENDA_TIME_ZONE = "Asia/Makassar";
const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BULAN_PER_TAHUN = 12;

/** Jumlah tahun ke belakang & ke depan (dari tahun berjalan) pada pilihan filter. */
const TAHUN_PILIHAN_MUNDUR = 2;
const TAHUN_PILIHAN_MAJU = 1;

export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

export type StatusAgenda = "akan-datang" | "berlangsung" | "selesai";

export const STATUS_AGENDA_LABEL: Record<StatusAgenda, string> = {
  "akan-datang": "Akan datang",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
};

export const STATUS_AGENDA_COLOR: Record<StatusAgenda, string> = {
  "akan-datang": "blue",
  berlangsung: "green",
  selesai: "gray",
};

type DateLike = Date | string;
type AgendaRange = { tanggal: DateLike; tanggalSelesai?: DateLike | null };

const toMs = (value: DateLike) => new Date(value).getTime();

/** Nomor hari (sejak epoch) pada zona WITA. */
function nomorHariWita(ms: number): number {
  return Math.floor((ms + WITA_OFFSET_MS) / MS_PER_DAY);
}

/** Awal hari ini (00:00 WITA) sebagai Date UTC. */
export function awalHariWita(now: Date): Date {
  return new Date(nomorHariWita(now.getTime()) * MS_PER_DAY - WITA_OFFSET_MS);
}

/** Rentang [gte, lt) satu tahun atau satu bulan (bulan 1-12) di WITA. */
export function rentangTahunBulan(tahun: number, bulan?: number): { gte: Date; lt: Date } {
  const awal = bulan === undefined ? 0 : bulan - 1;
  const akhir = bulan === undefined ? BULAN_PER_TAHUN : bulan;
  return {
    gte: new Date(Date.UTC(tahun, awal, 1) - WITA_OFFSET_MS),
    lt: new Date(Date.UTC(tahun, akhir, 1) - WITA_OFFSET_MS),
  };
}

/** Status agenda terhadap `now`: akan datang, berlangsung (hari ini ada di rentang), atau selesai. */
export function statusAgenda(item: AgendaRange, now: Date): StatusAgenda {
  const hariIni = nomorHariWita(now.getTime());
  const mulai = nomorHariWita(toMs(item.tanggal));
  const selesai = nomorHariWita(toMs(item.tanggalSelesai ?? item.tanggal));
  if (selesai < hariIni) return "selesai";
  if (mulai > hariIni) return "akan-datang";
  return "berlangsung";
}

/** Jumlah agenda per bulan (indeks 0 = Januari) pada `tahun`; agenda multi-hari dihitung di tiap bulan yang dilewati. */
export function hitungAgendaPerBulan(items: AgendaRange[], tahun: number): number[] {
  const hasil: number[] = Array(BULAN_PER_TAHUN).fill(0);
  for (let i = 0; i < BULAN_PER_TAHUN; i++) {
    const { gte, lt } = rentangTahunBulan(tahun, i + 1);
    hasil[i] = items.filter(
      (it) => toMs(it.tanggal) < lt.getTime() && toMs(it.tanggalSelesai ?? it.tanggal) >= gte.getTime(),
    ).length;
  }
  return hasil;
}

/** Tahun berjalan menurut WITA. */
export function tahunBerjalan(now: Date): number {
  return new Date(now.getTime() + WITA_OFFSET_MS).getUTCFullYear();
}

/** Daftar tahun untuk pilihan filter, terbaru dulu. */
export function daftarTahunAgenda(now: Date): number[] {
  const sekarang = tahunBerjalan(now);
  const hasil: number[] = [];
  for (let t = sekarang + TAHUN_PILIHAN_MAJU; t >= sekarang - TAHUN_PILIHAN_MUNDUR; t--) hasil.push(t);
  return hasil;
}

const partsOf = (ms: number) => {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: AGENDA_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(ms);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: pick("day"), month: pick("month"), year: pick("year") };
};

/** Teks tanggal agenda: "17 Oktober 2026", "17–18 Oktober 2026", atau "30 Oktober 2026 – 2 November 2026". */
export function formatRentangTanggal(item: AgendaRange): string {
  const a = partsOf(toMs(item.tanggal));
  if (!item.tanggalSelesai) return `${a.day} ${a.month} ${a.year}`;
  const b = partsOf(toMs(item.tanggalSelesai));
  if (a.day === b.day && a.month === b.month && a.year === b.year) return `${a.day} ${a.month} ${a.year}`;
  if (a.month === b.month && a.year === b.year) return `${a.day}–${b.day} ${a.month} ${a.year}`;
  return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
}
