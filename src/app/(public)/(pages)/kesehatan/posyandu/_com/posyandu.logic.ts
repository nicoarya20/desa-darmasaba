import { DEFAULT_TAB, POSYANDU_HREF, POSYANDU_TABS, PRIVASI_AMBANG, type PosyanduTab } from "./posyandu.meta";

/** Bentuk respons `GET /api/kesehatan/ringkasankesehatan/stats` yang dipakai halaman publik. */
export type PosyanduStats = {
  ibuHamilAktif: number;
  balitaTerdaftar: number;
  alertStunting: number;
  imunisasiLengkapPct: number;
  pemeriksaanRutinPct: number;
  giziBaikPct: number;
  /** Target prevalensi stunting desa (%) yang diatur admin; 0 = belum diatur. */
  targetStuntingPct: number;
};

export type HitunganKey = "ibuHamilAktif" | "balitaTerdaftar" | "alertStunting";
export type PersenKey = "imunisasiLengkapPct" | "giziBaikPct" | "pemeriksaanRutinPct";

/** Angka satu banjar; `stats` null = permintaan banjar itu gagal. */
export type BanjarStatsRow = { id: string; name: string; stats: PosyanduStats | null };

/** Hitungan untuk publik: angka asli berpemisah ribuan Indonesia (tanpa samaran "< 3", keputusan user 2026-11-12). */
export function formatHitungan(n: number): string {
  return n.toLocaleString("id-ID");
}

/**
 * Target stunting yang layak tampil: hanya bila diatur (> 0). API membalas 0 saat admin belum mengisi,
 * jadi 0/null tidak ditulis "0%". Sengaja tanpa perbandingan dengan alertStunting: itu hitungan
 * gabungan status alert + stunting, bukan prevalensi stunting.
 */
export function targetStuntingTampil(pct: number | null | undefined): number | null {
  return typeof pct === "number" && pct > 0 ? Math.min(pct, 100) : null;
}

export type PersenTampil = { kind: "pct"; value: number } | { kind: "sedikit" } | { kind: "kosong" };

/**
 * Persentase balita boleh tampil? Tanpa balita → "kosong" (API membalas 0%, padahal bukan 0%);
 * balita di bawah ambang → "sedikit" (persen bisa dibalik ke anak tertentu).
 */
export function persenTampil(pct: number, balita: number): PersenTampil {
  if (balita <= 0) return { kind: "kosong" };
  if (balita < PRIVASI_AMBANG) return { kind: "sedikit" };
  return { kind: "pct", value: Math.min(100, Math.max(0, pct)) };
}

/** Nama banjar dari API sudah ada yang berawalan "Banjar"; jangan dobel ("Banjar Banjar Anggrek"). */
export function banjarLabel(name: string): string {
  const trimmed = name.trim();
  return /^banjar\b/i.test(trimmed) ? trimmed : `Banjar ${trimmed}`;
}

/** Tautan `tel:` dari nomor yang diketik admin (spasi/tanda hubung dibuang); null bila tak ada digit. */
export function telHref(nomor: string | null | undefined): string | null {
  const raw = (nomor ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${raw.startsWith("+") ? "+" : ""}${digits}`;
}

/** Jalankan `fn` untuk tiap item dengan paling banyak `limit` berjalan bersamaan; urutan hasil = urutan item. */
export async function mapWithLimit<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, worker));
  return results;
}

/**
 * Data yang tidak terhubung ke banjar (posyandu tanpa banjar) ikut di angka desa tapi tidak di baris banjar.
 * Dihitung dari angka mentah; hasilnya hanya dipakai untuk menampilkan catatan, bukan angka.
 */
export function hasUnassigned(desa: PosyanduStats, rows: readonly BanjarStatsRow[], key: HitunganKey): boolean {
  const sum = rows.reduce((total, row) => total + (row.stats?.[key] ?? 0), 0);
  return rows.every((row) => row.stats) && desa[key] > sum;
}

/** Tab dari `?tab=`; nilai asing → Ringkasan. */
export function parseTab(value: string | null | undefined): PosyanduTab {
  return (POSYANDU_TABS as readonly string[]).includes(value ?? "") ? (value as PosyanduTab) : DEFAULT_TAB;
}

/** URL halaman pada tab tertentu (Ringkasan = URL polos). */
export function posyanduTabHref(tab: PosyanduTab): string {
  return tab === DEFAULT_TAB ? POSYANDU_HREF : `${POSYANDU_HREF}?tab=${tab}`;
}

export const posyanduDetailHref = (id: string) => `${POSYANDU_HREF}/${encodeURIComponent(id)}`;
