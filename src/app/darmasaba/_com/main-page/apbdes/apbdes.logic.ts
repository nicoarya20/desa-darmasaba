import type { APBDes, APBDesItem } from "./types/apbdes";

/** Kategori APBDes yang ditampilkan di beranda, sesuai urutan tampil. */
export type Tipe = "pendapatan" | "belanja" | "pembiayaan";
export const TIPE_ORDER: readonly Tipe[] = ["pendapatan", "belanja", "pembiayaan"];

/** Satu baris rincian anggaran (item + realisasi dirinya dan seluruh turunannya). */
export type DetailRow = {
  id: string;
  kode: string;
  uraian: string;
  depth: number;
  hasChildren: boolean;
  anggaran: number;
  realisasi: number;
  persen: number | null;
};

/** Ringkasan satu kategori: pagu, realisasi, persen, dan baris rinciannya. */
export type CategorySummary = {
  tipe: Tipe;
  pagu: number;
  realisasi: number;
  persen: number | null;
  rows: DetailRow[];
};

/** Membandingkan kode rekening per segmen secara numerik ("4.10" sesudah "4.9"). */
export function compareKode(a: string, b: string): number {
  const pa = a.split(".");
  const pb = b.split(".");
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    const diff = Number.isNaN(na) || Number.isNaN(nb) ? pa[i].localeCompare(pb[i]) : na - nb;
    if (diff !== 0) return diff;
  }
  return 0;
}

/** True bila `kode` berada di bawah `ancestor` dalam hirarki kode rekening. */
export function isDescendant(kode: string, ancestor: string): boolean {
  return kode.startsWith(`${ancestor}.`);
}

/** Persen realisasi terhadap pagu; null bila pagu 0 (persen tidak bermakna). */
export function percent(realisasi: number, pagu: number): number | null {
  return pagu > 0 ? (realisasi / pagu) * 100 : null;
}

function ownRealisasi(item: APBDesItem): number {
  return (item.realisasiItems ?? []).reduce((sum, r) => sum + (r.jumlah || 0), 0);
}

/**
 * Meringkas satu kategori. Data bisa berhirarki (mis. 4 → 4.1 → 4.1.1) di mana induk
 * sudah berisi jumlah anaknya, jadi pagu kategori = jumlah item akar saja, bukan semua item.
 */
export function summarizeCategory(tipe: Tipe, items: readonly APBDesItem[]): CategorySummary {
  const list = items.filter((i) => i.tipe === tipe).sort((a, b) => compareKode(a.kode, b.kode));
  const rows = list.map((item, index): DetailRow => {
    const family = list.filter((o) => o === item || isDescendant(o.kode, item.kode));
    const realisasi = family.reduce((sum, o) => sum + ownRealisasi(o), 0);
    return {
      id: item.id ?? `${tipe}-${item.kode}-${index}`,
      kode: item.kode,
      uraian: item.uraian,
      depth: list.filter((o) => isDescendant(item.kode, o.kode)).length,
      hasChildren: family.length > 1,
      anggaran: item.anggaran,
      realisasi,
      persen: percent(realisasi, item.anggaran),
    };
  });
  const pagu = rows.filter((r) => r.depth === 0).reduce((sum, r) => sum + r.anggaran, 0);
  const realisasi = list.reduce((sum, i) => sum + ownRealisasi(i), 0);
  return { tipe, pagu, realisasi, persen: percent(realisasi, pagu), rows };
}

/** Ringkasan ketiga kategori untuk satu APBDes. */
export function summarizeApbdes(items: readonly APBDesItem[]): CategorySummary[] {
  return TIPE_ORDER.map((tipe) => summarizeCategory(tipe, items));
}

/** Daftar tahun unik, terbaru di depan. */
export function listYears(data: readonly Pick<APBDes, "tahun">[]): number[] {
  const years = data.map((d) => d.tahun).filter((t): t is number => typeof t === "number");
  return Array.from(new Set(years)).sort((a, b) => b - a);
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** Rupiah penuh: `Rp 23.141.290.636`. */
export function formatRupiah(value: number): string {
  return `Rp ${rupiahFormatter.format(value)}`;
}

const COMPACT_UNITS: ReadonlyArray<readonly [number, string]> = [
  [1e12, "T"],
  [1e9, "M"],
  [1e6, "Jt"],
  [1e3, "Rb"],
];

/** Rupiah ringkas berskala Indonesia (Rb/Jt/M/T): `Rp 23,14 M`. */
export function formatRupiahCompact(value: number, fractionDigits = 2): string {
  const unit = COMPACT_UNITS.find(([size]) => Math.abs(value) >= size);
  if (!unit) return formatRupiah(value);
  const scaled = new Intl.NumberFormat("id-ID", { maximumFractionDigits: fractionDigits }).format(value / unit[0]);
  return `Rp ${scaled} ${unit[1]}`;
}

/** Persen satu desimal gaya Indonesia (`8,8%`); `–` bila tidak bermakna. */
export function formatPercent(value: number | null): string {
  if (value === null) return "–";
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`;
}

/** Lebar progress bar dalam persen, dibatasi 0–100 (realisasi bisa melebihi pagu). */
export function barWidth(value: number | null): number {
  return Math.min(100, Math.max(0, value ?? 0));
}

type Stamp = string | Date | null | undefined;

function toTime(value: Stamp): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Waktu pembaruan terakhir data satu tahun APBDes. Realisasi dan item disimpan di tabel
 * sendiri, jadi menambah realisasi tidak mengubah `updatedAt` APBDes — ambil yang terbaru dari ketiganya.
 */
export function latestUpdate(apbdes: Pick<APBDes, "updatedAt" | "items">): Date | null {
  const stamps: Stamp[] = [apbdes.updatedAt];
  for (const item of apbdes.items ?? []) {
    stamps.push(item.updatedAt);
    for (const r of item.realisasiItems ?? []) stamps.push(r.updatedAt);
  }
  const times = stamps.map(toTime).filter((t): t is number => t !== null);
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/** Zona waktu Desa Darmasaba (Bali, WITA) agar tanggal sama di perangkat mana pun. */
export const DESA_TIME_ZONE = "Asia/Makassar";

/** Tanggal panjang Indonesia: `3 November 2026`. */
export function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: DESA_TIME_ZONE }).format(date);
}
