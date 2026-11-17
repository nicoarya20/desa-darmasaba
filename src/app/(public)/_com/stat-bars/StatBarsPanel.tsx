import { formatPercent } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import type { CSSProperties } from "react";
import { formatJumlah, type StatBarItem, type StatBarRow, type StatBarsSummary } from "./stat-bars.logic";
import { STAT_BARS_VARS, statSegmentColor } from "./stat-bars.meta";
import s from "./stat-bars.module.css";
import { STAT_BARS_TEXT } from "./stat-bars.text";
import { StatSegmentFigures, StatSegmentLegend, type StatSegment } from "./StatSegments";

export type StatBarsPanelProps<T extends StatBarItem> = {
  /** id unik di halaman untuk `aria-labelledby` daftar. */
  titleId: string;
  title: string;
  caption?: string;
  /** Baris kecil di bawah caption, mis. "Periode 2025 · Data diperbarui 14 April 2026". */
  meta?: string;
  summary: StatBarsSummary<T>;
  /** Satuan setelah angka ("orang"); tanpa → angka saja. */
  unit?: string;
  /** Ada → kotak total di kanan kepala (hanya bila total terisi). */
  totalLabel?: string;
  /** Persen porsi tiap baris. Bawaan true. */
  showShare?: boolean;
  /** false → tanpa batang (mis. satuan antarbaris berbeda). Bawaan true. */
  showBars?: boolean;
  /** Segmen batang + legenda (mis. laki-laki | perempuan); nilai per baris dari `item.segments`. */
  segments?: readonly StatSegment[];
  notFilledLabel?: string;
  /** Catatan kaki di bawah daftar. */
  footnote?: string;
};

type RowOptions = Pick<StatBarsPanelProps<StatBarItem>, "unit" | "showShare" | "showBars" | "segments"> & { notFilledLabel: string };

/** Panel `#f5f5f7`: kepala (judul, caption, meta, legenda segmen, total), daftar batang horizontal HTML, catatan kaki. */
export function StatBarsPanel<T extends StatBarItem>(props: StatBarsPanelProps<T>) {
  const { titleId, title, caption, meta, summary, unit, totalLabel, segments, footnote } = props;
  const options: RowOptions = {
    unit,
    segments,
    showShare: props.showShare ?? true,
    showBars: props.showBars ?? true,
    notFilledLabel: props.notFilledLabel ?? STAT_BARS_TEXT.notFilled,
  };
  return (
    <div className={s.panel} style={STAT_BARS_VARS}>
      <div className={s.head}>
        <div>
          <h2 id={titleId} className={s.title}>
            {title}
          </h2>
          {caption ? <p className={s.caption}>{caption}</p> : null}
          {meta ? <p className={s.meta}>{meta}</p> : null}
          {segments && segments.length > 0 ? (
            <StatSegmentLegend segments={segments} totals={summary.segmentTotals} total={summary.total} />
          ) : null}
        </div>
        {totalLabel && summary.total !== null ? (
          <p className={s.total}>
            <span className={s.totalLabel}>{totalLabel}</span>
            <span className={s.totalValue}>
              {formatJumlah(summary.total)}
              {unit ? <span className={s.totalUnit}>{unit}</span> : null}
            </span>
          </p>
        ) : null}
      </div>
      <ol className={options.showBars ? s.list : `${s.list} ${s.noBars}`} aria-labelledby={titleId}>
        {summary.rows.map((row, i) => (
          // Label bisa ganda (data lama, mis. dua "SD"), jadi kunci = id.
          <StatBarRowItem key={row.id} row={row} index={i} options={options} />
        ))}
      </ol>
      {footnote ? <p className={s.note}>{footnote}</p> : null}
    </div>
  );
}

/** Satu baris: label, batang (tunggal atau bersegmen), angka + persen tercetak langsung (tanpa hover). */
export function StatBarRowItem({ row, index, options }: { row: StatBarRow; index: number; options: RowOptions }) {
  const { unit, showShare, showBars, segments, notFilledLabel } = options;
  if (row.value === null) {
    return (
      <li className={s.row}>
        <span className={s.name}>{row.label}</span>
        <span className={s.missing}>{notFilledLabel}</span>
      </li>
    );
  }
  const segmented = Boolean(segments?.length && row.segments?.length);
  return (
    <li className={segmented ? `${s.row} ${s.hasSegs}` : s.row}>
      <span className={s.name}>{row.label}</span>
      {showBars ? (
        <span className={s.track} aria-hidden>
          {segmented ? (
            <span className={`${s.bar} ${s.stack}`} style={{ width: `${row.width}%`, "--i": index } as CSSProperties}>
              {row.segments!.map((v, k) =>
                v ? <span key={k} className={s.seg} style={{ flexGrow: v, background: statSegmentColor(k) }} /> : null,
              )}
            </span>
          ) : (
            <span className={s.bar} style={{ width: `${row.width}%`, "--i": index } as CSSProperties} />
          )}
        </span>
      ) : null}
      <span className={s.figure}>
        {row.figure ? (
          <span className={s.count}>{row.figure}</span>
        ) : (
          <>
            <span className={s.count}>{formatJumlah(row.value)}</span>
            {unit ? <span className={s.unit}>{unit}</span> : null}
            {showShare && row.share !== null ? <span className={s.share}>{formatPercent(row.share)}</span> : null}
          </>
        )}
      </span>
      {segmented ? <StatSegmentFigures segments={segments!} values={row.segments!} wide={!showBars} /> : null}
    </li>
  );
}
