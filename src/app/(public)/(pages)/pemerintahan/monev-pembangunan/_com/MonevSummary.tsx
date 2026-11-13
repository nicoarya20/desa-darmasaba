import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { barWidth, formatPercent, formatRupiah, formatRupiahCompact } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import type { MonevSummary as MonevSummaryData } from "@/lib/kegiatan-pembangunan";
import { IconBackhoe, IconCash, IconTrendingUp, type Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { statusSegments } from "./monev.logic";
import { BRAND_ACCENT_VARS, statusVars } from "./monev.meta";
import s from "./monev.module.css";
import { MONEV_TEXT } from "./monev.text";

/** Tiga kartu ringkasan gaya APBDes: jumlah kegiatan + sebaran status, total anggaran, rata-rata progres. */
export function MonevSummary({ summary }: { summary: MonevSummaryData }) {
  const segments = statusSegments(summary);
  const sebaran = segments.map((g) => `${g.label} ${g.count}`).join(", ");
  const progres = barWidth(summary.rataRataProgres);
  const adaAnggaran = summary.totalAnggaran > 0;

  return (
    <div className={s.summary}>
      <SummaryCard icon={IconBackhoe} label={MONEV_TEXT.kegiatanLabel}>
        <p className={apb.amount}>
          {summary.totalKegiatan}
          <span className={s.unit}>{MONEV_TEXT.kegiatanUnit}</span>
        </p>
        <div className={s.stack} role="img" aria-label={`${MONEV_TEXT.statusBarLabel}: ${sebaran}`}>
          {segments
            .filter((g) => g.count > 0)
            .map((g) => (
              <span key={g.key} className={s.stackPart} style={{ ...statusVars(g.key), flexBasis: `${g.width}%` }} />
            ))}
        </div>
        <ul className={s.legend}>
          {segments.map((g) => (
            <li key={g.key} className={s.legendItem} style={statusVars(g.key)}>
              <span className={s.dot} aria-hidden />
              {g.label} <span className={s.legendCount}>{g.count}</span>
            </li>
          ))}
        </ul>
      </SummaryCard>

      <SummaryCard icon={IconCash} label={MONEV_TEXT.anggaranLabel} small>
        {adaAnggaran ? (
          <>
            <p className={`${apb.amount} ${s.smallAmount}`}>{formatRupiahCompact(summary.totalAnggaran)}</p>
            <p className={`${apb.amountFull} ${s.smallFull}`}>{formatRupiah(summary.totalAnggaran)}</p>
          </>
        ) : (
          <p className={`${apb.amount} ${s.smallAmount} ${s.amountEmpty}`}>{MONEV_TEXT.anggaranKosong}</p>
        )}
        <p className={s.foot}>{MONEV_TEXT.anggaranNote}</p>
      </SummaryCard>

      <SummaryCard icon={IconTrendingUp} label={MONEV_TEXT.progresLabel} small>
        <p className={`${apb.amount} ${s.smallAmount}`}>{formatPercent(summary.rataRataProgres)}</p>
        <p className={`${apb.amountFull} ${s.smallFull}`}>{MONEV_TEXT.progresNote}</p>
        <div
          className={apb.bar}
          role="progressbar"
          aria-label={MONEV_TEXT.progresLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progres)}
        >
          <span className={apb.barFill} style={{ width: `${progres}%` }} />
        </div>
      </SummaryCard>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, small, children }: { icon: Icon; label: string; small?: boolean; children: ReactNode }) {
  return (
    <article className={`${apb.card} ${small ? s.small : ""}`} style={BRAND_ACCENT_VARS}>
      <div className={apb.cardHead}>
        <span className={apb.icon} aria-hidden>
          <Icon size={22} stroke={1.75} />
        </span>
        <h3 className={apb.label}>{label}</h3>
      </div>
      {children}
    </article>
  );
}
