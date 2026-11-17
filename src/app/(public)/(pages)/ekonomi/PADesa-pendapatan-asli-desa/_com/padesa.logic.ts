import {
  isDescendant,
  latestUpdate,
  summarizeCategory,
  type DetailRow,
} from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import type { APBDes, APBDesItem } from "@/app/(public)/_com/main-page/apbdes/types/apbdes";

/** Kode rekening "Pendapatan Asli Desa" di APBDes (Permendagri 20/2018): 4.1 beserta turunannya (4.1.1, 4.1.2, …). */
export const PADES_KODE = "4.1";

/** True bila pos APBDes termasuk Pendapatan Asli Desa (kode 4.1 atau turunannya). */
export function isPadesItem(item: Pick<APBDesItem, "kode">): boolean {
  const kode = item.kode?.trim() ?? "";
  return kode === PADES_KODE || isDescendant(kode, PADES_KODE);
}

/** Pos PADes satu APBDes. Penanda kategori dipaksa "pendapatan" agar admin yang lupa mengisi `tipe` tetap terhitung. */
export function padesItems(items: readonly APBDesItem[] | null | undefined): APBDesItem[] {
  return (items ?? []).filter(isPadesItem).map((item) => ({ ...item, tipe: "pendapatan" as const }));
}

/** APBDes yang punya pos PADes, tahun terbesar dulu (tahun kosong diabaikan). */
export function apbdesWithPades<T extends Pick<APBDes, "tahun" | "items">>(list: readonly T[]): T[] {
  return list
    .filter((a) => typeof a.tahun === "number" && padesItems(a.items).length > 0)
    .sort((a, b) => b.tahun - a.tahun);
}

/** Pembanding tahun sebelumnya yang punya pos PADes. */
export type PadesPrevious = { tahun: number; pagu: number; selisih: number };

/** Ringkasan PADes tahun terbaru untuk halaman publik. */
export type PadesSummary = {
  tahun: number;
  updated: Date | null;
  pagu: number;
  realisasi: number;
  persen: number | null;
  rows: DetailRow[];
  /** Porsi pagu PADes terhadap total pagu Pendapatan Desa tahun yang sama; null bila tak bermakna. */
  porsi: number | null;
  pendapatanPagu: number;
  previous: PadesPrevious | null;
};

/** Hasil olah data APBDes untuk halaman: tak ada APBDes, APBDes ada tanpa pos 4.1, atau ringkasan PADes. */
export type PadesView = { kind: "noApbdes" } | { kind: "noPades" } | { kind: "ready"; summary: PadesSummary };

/** Porsi PADes terhadap Pendapatan Desa; null bila pagu pendapatan 0 atau datanya tidak konsisten (PADes > pendapatan). */
export function padesPorsi(padesPagu: number, pendapatanPagu: number): number | null {
  if (pendapatanPagu <= 0 || padesPagu <= 0 || padesPagu > pendapatanPagu) return null;
  return (padesPagu / pendapatanPagu) * 100;
}

/**
 * Ringkasan PADes: tahun terbesar yang punya pos 4.1 (bukan sekadar APBDes terbaru, agar halaman tidak kosong hanya
 * karena tahun baru belum dirinci), dibandingkan dengan tahun PADes sebelumnya. Total = jumlah pos akar (induk 4.1
 * sudah memuat anaknya), aturan yang sama dengan ringkasan APBDes.
 */
export function buildPadesView(list: readonly APBDes[]): PadesView {
  if (list.length === 0) return { kind: "noApbdes" };
  const [current, prev] = apbdesWithPades(list);
  if (!current) return { kind: "noPades" };

  const items = padesItems(current.items);
  const pades = summarizeCategory("pendapatan", items);
  const pendapatanPagu = summarizeCategory("pendapatan", current.items ?? []).pagu;
  const prevPagu = prev ? summarizeCategory("pendapatan", padesItems(prev.items)).pagu : null;

  return {
    kind: "ready",
    summary: {
      tahun: current.tahun,
      updated: latestUpdate({ updatedAt: current.updatedAt, items }),
      pagu: pades.pagu,
      realisasi: pades.realisasi,
      persen: pades.persen,
      rows: pades.rows,
      porsi: padesPorsi(pades.pagu, pendapatanPagu),
      pendapatanPagu,
      previous: prev && prevPagu !== null ? { tahun: prev.tahun, pagu: prevPagu, selisih: pades.pagu - prevPagu } : null,
    },
  };
}
