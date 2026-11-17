import {
  compareStatValueDesc,
  formatJumlah,
  parseJumlah,
  type StatBarItem,
} from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Satu baris DataBanjar yang sudah divalidasi. Angka tak terbaca → null ("belum diisi"), bukan 0. */
export type BanjarRow = {
  id: string;
  nama: string;
  penduduk: number | null;
  kk: number | null;
  /** Jumlah KELUARGA penerima BLT Dana Desa (KPM), bukan jiwa; lihat `MISKIN_LABEL` di `src/lib/data-banjar.ts`. */
  miskin: number | null;
  tahun: number | null;
  updatedAt: string | Date | null;
};

export type BanjarTotals = {
  /** Jumlah penduduk banjar yang terisi; null bila tak satu pun terisi. */
  penduduk: number | null;
  /** Jumlah KK banjar yang terisi; null bila tak satu pun terisi. */
  kk: number | null;
  /** Jumlah keluarga miskin; null bila `miskinTerisi` false. */
  miskin: number | null;
  /**
   * Admin dianggap sudah mengisi keluarga miskin bila minimal satu banjar > 0. Kolom DB NOT NULL default 0,
   * jadi "semua 0" (stg 2026-11-17: 12 × 0) tak bisa dibedakan dari belum diisi → keputusan user: tulis "belum diisi".
   */
  miskinTerisi: boolean;
  /** Rata-rata jiwa per KK dari banjar yang penduduk & KK-nya terisi (KK > 0); null bila tak ada. */
  jiwaPerKk: number | null;
};

/** Item batang per banjar: nilai = penduduk, `detail` = KK (+ keluarga miskin bila terisi). */
export type BanjarBar = StatBarItem & { kk: number | null; miskin: number | null };

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);

function readDate(v: unknown): string | Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

function readTahun(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Baris mentah API `databanjar/find-many` → `BanjarRow[]`. Baris tanpa `id` atau `nama` dibuang
 * (tak bisa diberi label); angka tak terbaca → null. Baris ganda (nama sama) TIDAK digabung: itu isian admin.
 */
export function parseBanjarRows(rows: unknown[]): BanjarRow[] {
  const out: BanjarRow[] = [];
  for (const raw of rows) {
    if (!isRecord(raw)) continue;
    const id = typeof raw.id === "string" ? raw.id : typeof raw.id === "number" ? String(raw.id) : "";
    const nama = typeof raw.nama === "string" ? raw.nama.trim() : "";
    if (!id || !nama) continue;
    out.push({
      id,
      nama,
      penduduk: parseJumlah(raw.penduduk),
      kk: parseJumlah(raw.kk),
      miskin: parseJumlah(raw.miskin),
      tahun: readTahun(raw.tahun),
      updatedAt: readDate(raw.updatedAt),
    });
  }
  return out;
}

const sumOf = (values: (number | null)[]): number | null => {
  const filled = values.filter((n): n is number => n !== null);
  return filled.length > 0 ? filled.reduce((a, b) => a + b, 0) : null;
};

/** Total desa dari baris banjar satu tahun (dipakai kepala section dan hero dashboard). */
export function banjarTotals(rows: readonly BanjarRow[]): BanjarTotals {
  const miskinTerisi = rows.some((r) => r.miskin !== null && r.miskin > 0);
  const paired = rows.filter((r) => r.penduduk !== null && r.kk !== null && r.kk > 0);
  const pairedKk = paired.reduce((a, r) => a + (r.kk ?? 0), 0);
  const pairedJiwa = paired.reduce((a, r) => a + (r.penduduk ?? 0), 0);
  return {
    penduduk: sumOf(rows.map((r) => r.penduduk)),
    kk: sumOf(rows.map((r) => r.kk)),
    miskin: miskinTerisi ? sumOf(rows.map((r) => r.miskin)) : null,
    miskinTerisi,
    jiwaPerKk: pairedKk > 0 ? pairedJiwa / pairedKk : null,
  };
}

/** Rasio jiwa per KK gaya Indonesia, satu desimal: `4,4`. */
export function formatJiwaPerKk(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value);
}

/** Teks kecil di bawah nama banjar: "230 KK", plus "12 keluarga miskin" hanya bila kolom miskin terisi. */
export function banjarDetail(row: BanjarRow, miskinTerisi: boolean, label: { kk: string; miskin: string }): string | undefined {
  const parts: string[] = [];
  if (row.kk !== null) parts.push(`${formatJumlah(row.kk)} ${label.kk}`);
  if (miskinTerisi && row.miskin !== null) parts.push(`${formatJumlah(row.miskin)} ${label.miskin}`);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/** Baris → item batang, urut penduduk terbanyak (belum diisi di akhir; nilai sama tetap urutan nama dari API). */
export function toBanjarBars(rows: readonly BanjarRow[], miskinTerisi: boolean, label: { kk: string; miskin: string }): BanjarBar[] {
  return rows
    .map((r) => ({
      id: r.id,
      label: r.nama,
      value: r.penduduk,
      kk: r.kk,
      miskin: r.miskin,
      detail: banjarDetail(r, miskinTerisi, label),
      updatedAt: r.updatedAt,
    }))
    .sort(compareStatValueDesc);
}
