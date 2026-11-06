import { APBDES_TEXT } from "../apbdes.text";
import { barWidth, formatPercent, formatRupiah, formatRupiahCompact, type CategorySummary } from "../apbdes.logic";
import { TIPE_META, accentVars } from "../apbdes.meta";
import s from "../apbdes.module.css";

/** Tiga kartu ringkasan kategori: pagu ringkas + penuh, progress dan persen realisasi. */
export function ApbdesSummary({ categories }: { categories: readonly CategorySummary[] }) {
  return (
    <div className={s.summary}>
      {categories.map((c) => (
        <SummaryCard key={c.tipe} category={c} />
      ))}
    </div>
  );
}

function SummaryCard({ category: c }: { category: CategorySummary }) {
  const Icon = TIPE_META[c.tipe].icon;
  const label = APBDES_TEXT.tipe[c.tipe];
  const width = barWidth(c.persen);

  return (
    <article className={s.card} style={accentVars(c.tipe)}>
      <div className={s.cardHead}>
        <span className={s.icon} aria-hidden>
          <Icon size={22} stroke={1.75} />
        </span>
        <h3 className={s.label}>{label}</h3>
      </div>
      <p className={s.amount}>{formatRupiahCompact(c.pagu)}</p>
      <p className={s.amountFull}>
        {APBDES_TEXT.pagu} {formatRupiah(c.pagu)}
      </p>
      <div
        className={s.bar}
        role="progressbar"
        aria-label={APBDES_TEXT.progressLabel(label)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
      >
        <span className={s.barFill} style={{ width: `${width}%` }} />
      </div>
      <p className={s.meta}>
        {c.realisasi > 0 ? (
          <>
            <span>
              {APBDES_TEXT.realisasi} {formatRupiahCompact(c.realisasi)}
            </span>
            <span className={s.metaPct}>{formatPercent(c.persen)}</span>
          </>
        ) : (
          <span>{APBDES_TEXT.noRealisasi}</span>
        )}
      </p>
    </article>
  );
}
