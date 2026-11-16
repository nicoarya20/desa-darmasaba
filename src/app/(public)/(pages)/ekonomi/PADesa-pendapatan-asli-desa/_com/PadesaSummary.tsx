import { APBDES_TEXT } from '@/app/(public)/_com/main-page/apbdes/apbdes.text';
import {
  barWidth,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { TIPE_META, accentVars } from '@/app/(public)/_com/main-page/apbdes/apbdes.meta';
import apb from '@/app/(public)/_com/main-page/apbdes/apbdes.module.css';
import { IconChartPie } from '@tabler/icons-react';
import type { PadesSummary } from './padesa.logic';
import s from './padesa.module.css';
import { PADESA_TEXT as T } from './padesa.text';

const PendapatanIcon = TIPE_META.pendapatan.icon;

/** Kartu ringkasan gaya APBDes: anggaran PADes (+ selisih tahun sebelumnya, realisasi) dan porsinya dari Pendapatan Desa. */
export function PadesaSummary({ summary }: { summary: PadesSummary }) {
  const width = barWidth(summary.persen);

  return (
    <section className={s.summary} aria-label={T.summaryLabel}>
      <article className={apb.card} style={accentVars('pendapatan')}>
        <div className={apb.cardHead}>
          <span className={apb.icon} aria-hidden>
            <PendapatanIcon size={22} stroke={1.75} />
          </span>
          <h2 className={apb.label}>{T.cardPagu}</h2>
        </div>
        <p className={apb.amount}>{formatRupiahCompact(summary.pagu)}</p>
        <p className={apb.amountFull}>
          <span>
            {APBDES_TEXT.pagu} {formatRupiah(summary.pagu)}
          </span>
          {summary.previous ? (
            <span className={s.delta}>{T.delta(summary.previous.selisih, summary.previous.tahun)}</span>
          ) : null}
        </p>
        <div
          className={apb.bar}
          role="progressbar"
          aria-label={APBDES_TEXT.progressLabel(T.title)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(width)}
        >
          <span className={apb.barFill} style={{ width: `${width}%` }} />
        </div>
        <p className={apb.meta}>
          {summary.realisasi > 0 ? (
            <>
              <span>
                {APBDES_TEXT.realisasi} {formatRupiahCompact(summary.realisasi)}
              </span>
              <span className={apb.metaPct}>{formatPercent(summary.persen)}</span>
            </>
          ) : (
            <span>{APBDES_TEXT.noRealisasi}</span>
          )}
        </p>
      </article>

      {summary.porsi !== null ? (
        <article className={apb.card} style={accentVars('belanja')}>
          <div className={apb.cardHead}>
            <span className={apb.icon} aria-hidden>
              <IconChartPie size={22} stroke={1.75} />
            </span>
            <h2 className={apb.label}>{T.cardPorsi}</h2>
          </div>
          <p className={apb.amount}>{formatPercent(summary.porsi)}</p>
          <p className={apb.amountFull}>{T.porsiNote(formatRupiahCompact(summary.pendapatanPagu))}</p>
          {/* Teks persen di atas sudah menyampaikan nilainya; batang hanya penegas visual. */}
          <div className={apb.bar} aria-hidden>
            <span className={apb.barFill} style={{ width: `${barWidth(summary.porsi)}%` }} />
          </div>
        </article>
      ) : null}
    </section>
  );
}
