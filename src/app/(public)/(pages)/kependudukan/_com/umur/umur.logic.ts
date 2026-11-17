import { parseJumlah, summarizeStatBars, type StatBarItem, type StatBarsSummary } from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Rentang umur dalam tahun; `hi` null = terbuka ke atas ("65+"). */
export type Rentang = { lo: number; hi: number | null };

/** Satu kelompok umur siap tampil; `rentang` null = teks rentang tidak terbaca. */
export type UmurRow = StatBarItem & { rentang: Rentang | null; tahun: number };

/** Batas usia produktif menurut BPS: anak 0–14, produktif 15–64, lansia 65 ke atas. */
export const BATAS_PRODUKTIF = 15;
export const BATAS_LANSIA = 65;

const CLOSED = /^(\d{1,3})\s*(?:-|–|—|s\.?\s*d\.?|sampai)\s*(\d{1,3})(?:\s*(?:tahun|th))?$/i;
const OPEN = /^(\d{1,3})\s*(?:\+\s*(?:tahun|th)?|(?:tahun|th)?\s*(?:ke\s*atas|keatas|lebih))$/i;

/** "0-14" / "0 – 14 tahun" → {0,14}; "65+" / "65+ tahun" / "65 ke atas" → {65,null}; selain itu (atau lo > hi) → null. */
export function parseRentang(value: string): Rentang | null {
  const s = value.trim();
  const closed = CLOSED.exec(s);
  if (closed) {
    const lo = Number(closed[1]);
    const hi = Number(closed[2]);
    return lo <= hi ? { lo, hi } : null;
  }
  const open = OPEN.exec(s);
  return open ? { lo: Number(open[1]), hi: null } : null;
}

/** Label tampil: "0–14 tahun", "65 tahun ke atas"; rentang tak terbaca → teks admin apa adanya. */
export function rentangLabel(raw: string, rentang: Rentang | null): string {
  if (!rentang) return raw.trim();
  return rentang.hi === null ? `${rentang.lo} tahun ke atas` : `${rentang.lo}–${rentang.hi} tahun`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Urut umur: batas bawah, lalu batas atas (terbuka paling akhir); tak terbaca di paling akhir, urutan asal dipertahankan. */
export function compareRentang(a: UmurRow, b: UmurRow): number {
  if (!a.rentang || !b.rentang) return a.rentang === b.rentang ? 0 : a.rentang ? -1 : 1;
  if (a.rentang.lo !== b.rentang.lo) return a.rentang.lo - b.rentang.lo;
  return (a.rentang.hi ?? Infinity) - (b.rentang.hi ?? Infinity);
}

/**
 * Baris mentah API `distribusiumur/find-many` → kelompok umur urut umur. Dibuang: bukan objek, tanpa `id`,
 * atau `rentangUmur` kosong. `jumlah` tak terbaca → value null ("Belum diisi"), tidak ditebak.
 */
export function parseUmurRows(rows: unknown[]): UmurRow[] {
  const out: UmurRow[] = [];
  for (const r of rows) {
    if (!isRecord(r) || typeof r.id !== "string" || typeof r.rentangUmur !== "string" || r.rentangUmur.trim() === "") continue;
    const rentang = parseRentang(r.rentangUmur);
    out.push({
      id: r.id,
      label: rentangLabel(r.rentangUmur, rentang),
      value: parseJumlah(r.jumlah),
      rentang,
      tahun: Number(r.tahun),
      // ApiFetch (Eden) mengubah tanggal ISO jadi Date; fetch biasa memberi string.
      updatedAt: typeof r.updatedAt === "string" || r.updatedAt instanceof Date ? r.updatedAt : null,
    });
  }
  return out.sort(compareRentang);
}

function overlaps(a: Rentang, b: Rentang): boolean {
  return a.lo <= (b.hi ?? Infinity) && b.lo <= (a.hi ?? Infinity);
}

/** Masalah susunan kelompok yang membuat total & persen tidak jujur. */
export type UmurIssue = { kind: "tumpangTindih"; a: string; b: string } | { kind: "takTerbaca"; label: string };

/** Pasangan tumpang tindih pertama (urut umur) atau rentang tak terbaca pertama; null = kelompok saling lepas. */
export function findUmurIssue(rows: readonly UmurRow[]): UmurIssue | null {
  const unread = rows.find((r) => !r.rentang);
  if (unread) return { kind: "takTerbaca", label: unread.label };
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      if (overlaps(rows[i].rentang!, rows[j].rentang!)) return { kind: "tumpangTindih", a: rows[i].label, b: rows[j].label };
    }
  }
  return null;
}

/** Angka turunan usia produktif (jiwa) dan rasio ketergantungan (per 100 usia produktif). */
export type UmurTurunan = { anak: number; produktif: number; lansia: number; total: number; persenProduktif: number; rasio: number };

/**
 * Hanya bila aman: kelompok saling lepas, semua terisi, menyambung dari umur 0 tanpa celah sampai kelompok terbuka,
 * dan tak ada kelompok yang melintasi batas 15 atau 65. Selain itu null (angka tidak ditampilkan).
 */
export function umurTurunan(rows: readonly UmurRow[]): UmurTurunan | null {
  if (rows.length === 0 || findUmurIssue(rows)) return null;
  if (rows.some((r) => r.value === null)) return null;
  const sorted = [...rows].sort(compareRentang);
  if (sorted[0].rentang!.lo !== 0 || sorted[sorted.length - 1].rentang!.hi !== null) return null;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rentang!.lo !== (sorted[i - 1].rentang!.hi ?? Infinity) + 1) return null;
  }
  let anak = 0;
  let produktif = 0;
  let lansia = 0;
  for (const r of sorted) {
    const { lo, hi } = r.rentang!;
    const top = hi ?? Infinity;
    if (top < BATAS_PRODUKTIF) anak += r.value!;
    else if (lo >= BATAS_PRODUKTIF && top < BATAS_LANSIA) produktif += r.value!;
    else if (lo >= BATAS_LANSIA) lansia += r.value!;
    else return null;
  }
  if (produktif === 0) return null;
  const total = anak + produktif + lansia;
  return { anak, produktif, lansia, total, persenProduktif: (produktif / total) * 100, rasio: ((anak + lansia) / produktif) * 100 };
}

/** Ringkasan panel: urutan umur tetap (tanpa peringkat), plus masalah susunan bila ada. */
export function summarizeUmur(rows: readonly UmurRow[]): { summary: StatBarsSummary<UmurRow>; issue: UmurIssue | null } {
  return { summary: summarizeStatBars(rows), issue: findUmurIssue(rows) };
}

/** Bilangan desimal gaya Indonesia, satu angka di belakang koma: `47,9`. */
export function formatDesimal(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value);
}
