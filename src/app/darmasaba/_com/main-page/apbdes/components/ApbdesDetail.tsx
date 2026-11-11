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
import d from "../apbdes.detail.module.css";
import s from "../apbdes.module.css";

/** `compact` = beranda (semua tertutup); `full` = halaman detail (semua terbuka + kolom Lebih/(Kurang)). */
export type DetailVariant = "compact" | "full";

type Props = { categories: readonly CategorySummary[]; variant?: DetailVariant };

/** Rincian anggaran per kategori (accordion): hirarki kode, progress realisasi, dan anggaran tiap pos. */
export function ApbdesDetail({ categories, variant = "compact" }: Props) {
  const withRows = categories.filter((c) => c.rows.length > 0);
  const full = variant === "full";

  return (
    <div className={s.panel} data-variant={variant}>
      <h3 className={s.panelTitle}>{APBDES_TEXT.detailTitle}</h3>
      <Accordion
        multiple
        defaultValue={full ? withRows.map((c) => c.tipe) : []}
        classNames={{ item: d.accItem, control: d.accControl, content: d.accContent }}
      >
        {withRows.map((c) => {
          const Icon = TIPE_META[c.tipe].icon;
          return (
            <Accordion.Item key={c.tipe} value={c.tipe} style={accentVars(c.tipe)}>
              <Accordion.Control
                icon={
                  <span className={d.accIcon} aria-hidden>
                    <Icon size={18} stroke={1.75} />
                  </span>
                }
              >
                <span className={d.accLabel}>
                  <span className={d.accName}>{APBDES_TEXT.tipe[c.tipe]}</span>
                  <span className={d.accMeta}>
                    {APBDES_TEXT.posCount(c.rows.length)} · {formatRupiahCompact(c.pagu)}
                  </span>
                </span>
              </Accordion.Control>
              <Accordion.Panel>
                <div className={d.rowHead} aria-hidden>
                  <span />
                  <span>{APBDES_TEXT.colUraian}</span>
                  <span>{APBDES_TEXT.colRealisasi}</span>
                  <span>{APBDES_TEXT.colAnggaran}</span>
                  {full ? <span>{APBDES_TEXT.colSelisih}</span> : null}
                </div>
                <ul className={d.rows}>
                  {c.rows.map((r) => (
                    <li
                      key={r.id}
                      className={d.row}
                      data-parent={r.hasChildren || undefined}
                      style={{ "--depth": r.depth } as CSSProperties}
                    >
                      <span className={d.kode}>{r.kode}</span>
                      <span className={d.uraian}>{r.uraian}</span>
                      <RowProgress row={r} />
                      <span className={d.pagu}>{formatRupiah(r.anggaran)}</span>
                      {full ? (
                        <span className={d.selisih}>
                          <span className={d.cellLabel}>{APBDES_TEXT.colSelisih} </span>
                          {formatRupiah(r.selisih)}
                        </span>
                      ) : null}
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
    <span className={d.progress}>
      <span className={d.progressLine}>
        <span
          className={d.rowBar}
          role="progressbar"
          aria-label={APBDES_TEXT.progressLabel(row.uraian)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(width)}
        >
          <span className={s.barFill} style={{ width: `${width}%` }} />
        </span>
        <span className={d.progressPct}>{formatPercent(row.persen)}</span>
      </span>
      {row.realisasi > 0 ? (
        <span className={d.real}>
          {/* Label terlihat hanya di ponsel (header kolom disembunyikan); di desktop tetap terbaca screen reader. */}
          <span className={d.cellLabel}>{APBDES_TEXT.realisasi} </span>
          {formatRupiah(row.realisasi)}
        </span>
      ) : null}
    </span>
  );
}
