import { Accordion } from "@mantine/core";
import type { CSSProperties } from "react";
import { APBDES_TEXT } from "../apbdes.text";
import {
  barWidth,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
  type CategorySummary,
  type DetailRow,
} from "../apbdes.logic";
import { TIPE_META, accentVars } from "../apbdes.meta";
import s from "../apbdes.module.css";

/** Rincian anggaran per kategori (accordion): hirarki kode, progress realisasi, dan anggaran tiap pos. */
export function ApbdesDetail({ categories }: { categories: readonly CategorySummary[] }) {
  const withRows = categories.filter((c) => c.rows.length > 0);

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{APBDES_TEXT.detailTitle}</h3>
      <Accordion multiple classNames={{ item: s.accItem, control: s.accControl, content: s.accContent }}>
        {withRows.map((c) => {
          const Icon = TIPE_META[c.tipe].icon;
          return (
            <Accordion.Item key={c.tipe} value={c.tipe} style={accentVars(c.tipe)}>
              <Accordion.Control
                icon={
                  <span className={s.accIcon} aria-hidden>
                    <Icon size={18} stroke={1.75} />
                  </span>
                }
              >
                <span className={s.accLabel}>
                  <span className={s.accName}>{APBDES_TEXT.tipe[c.tipe]}</span>
                  <span className={s.accMeta}>
                    {APBDES_TEXT.posCount(c.rows.length)} · {formatRupiahCompact(c.pagu)}
                  </span>
                </span>
              </Accordion.Control>
              <Accordion.Panel>
                <div className={s.rowHead} aria-hidden>
                  <span />
                  <span>{APBDES_TEXT.colUraian}</span>
                  <span>{APBDES_TEXT.colRealisasi}</span>
                  <span>{APBDES_TEXT.colAnggaran}</span>
                </div>
                <ul className={s.rows}>
                  {c.rows.map((r) => (
                    <li
                      key={r.id}
                      className={s.row}
                      data-parent={r.hasChildren || undefined}
                      style={{ "--depth": r.depth } as CSSProperties}
                    >
                      <span className={s.kode}>{r.kode}</span>
                      <span className={s.uraian}>{r.uraian}</span>
                      <RowProgress row={r} />
                      <span className={s.pagu}>{formatRupiah(r.anggaran)}</span>
                    </li>
                  ))}
                </ul>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}

/** Bar + persen realisasi satu pos; nominal realisasi muncul bila sudah ada. Pos beranggaran 0 tanpa bar. */
function RowProgress({ row }: { row: DetailRow }) {
  if (row.persen === null) return <span />;
  const width = barWidth(row.persen);

  return (
    <span className={s.progress}>
      <span className={s.progressLine}>
        <span
          className={s.rowBar}
          role="progressbar"
          aria-label={APBDES_TEXT.progressLabel(row.uraian)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(width)}
        >
          <span className={s.barFill} style={{ width: `${width}%` }} />
        </span>
        <span className={s.progressPct}>{formatPercent(row.persen)}</span>
      </span>
      {row.realisasi > 0 ? (
        <span className={s.real}>
          {/* Label terlihat hanya di ponsel (header kolom disembunyikan); di desktop tetap terbaca screen reader. */}
          <span className={s.realLabel}>{APBDES_TEXT.realisasi} </span>
          {formatRupiah(row.realisasi)}
        </span>
      ) : null}
    </span>
  );
}
