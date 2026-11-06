import { Accordion } from "@mantine/core";
import type { CSSProperties } from "react";
import { APBDES_TEXT } from "../apbdes.text";
import { formatPercent, formatRupiah, formatRupiahCompact, type CategorySummary } from "../apbdes.logic";
import { TIPE_META, accentVars } from "../apbdes.meta";
import s from "../apbdes.module.css";

/** Rincian anggaran per kategori (accordion), berindentasi sesuai hirarki kode rekening. */
export function ApbdesDetail({ categories }: { categories: readonly CategorySummary[] }) {
  const withRows = categories.filter((c) => c.rows.length > 0);

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{APBDES_TEXT.detailTitle}</h3>
      <Accordion multiple classNames={{ item: s.accItem, control: s.accControl, content: s.accContent }}>
        {withRows.map((c) => {
          const Icon = TIPE_META[c.tipe].icon;
          return (
            <Accordion.Item key={c.tipe} value={c.tipe}>
              <Accordion.Control
                icon={
                  <span className={s.accIcon} style={accentVars(c.tipe)} aria-hidden>
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
                      <span className={s.values}>
                        <span className={s.pagu}>{formatRupiah(r.anggaran)}</span>
                        {r.realisasi > 0 ? (
                          <span className={s.real}>
                            {APBDES_TEXT.realisasi} {formatRupiah(r.realisasi)} · {formatPercent(r.persen)}
                          </span>
                        ) : null}
                      </span>
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
