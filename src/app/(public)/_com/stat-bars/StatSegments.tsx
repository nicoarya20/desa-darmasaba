import { formatPercent } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { formatJumlah } from "./stat-bars.logic";
import { statSegmentColor } from "./stat-bars.meta";
import s from "./stat-segments.module.css";

/** Satu segmen batang (mis. "Laki-laki"); warna mengikuti urutan (brand, lalu turunan brand). */
export type StatSegment = { label: string };

/** Legenda di kepala panel: titik warna + label, dengan jumlah dan porsi tiap segmen bila tersedia. */
export function StatSegmentLegend({
  segments,
  totals,
  total,
}: {
  segments: readonly StatSegment[];
  totals: readonly number[] | null;
  total: number | null;
}) {
  return (
    <ul className={s.legend}>
      {segments.map((seg, k) => {
        const value = totals?.[k];
        return (
          <li key={seg.label} className={s.legendItem}>
            <span className={s.dot} style={{ background: statSegmentColor(k) }} aria-hidden />
            <span>{seg.label}</span>
            {value !== undefined ? <span className={s.legendValue}>{formatJumlah(value)}</span> : null}
            {value !== undefined && total ? <span className={s.legendShare}>{formatPercent((value / total) * 100)}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Rincian angka per segmen di bawah batang satu baris ("Laki-laki 260 · Perempuan 310"). */
export function StatSegmentFigures({
  segments,
  values,
  wide = false,
}: {
  segments: readonly StatSegment[];
  values: readonly (number | null)[];
  /** Panel tanpa batang: rincian selebar baris. */
  wide?: boolean;
}) {
  return (
    <span className={wide ? `${s.segFigures} ${s.wide}` : s.segFigures}>
      {segments.map((seg, k) => (
        <span key={seg.label} className={s.segFigure}>
          <span className={s.dot} style={{ background: statSegmentColor(k) }} aria-hidden />
          {seg.label} <span className={s.segValue}>{values[k] === null || values[k] === undefined ? "–" : formatJumlah(values[k]!)}</span>
        </span>
      ))}
    </span>
  );
}
