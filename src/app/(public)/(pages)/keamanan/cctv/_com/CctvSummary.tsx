import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { IconDeviceCctv, IconVideo, IconVideoOff, type Icon } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import type { CctvSummary as Summary } from "./cctv.logic";
import { BRAND_ACCENT_VARS, statusVars } from "./cctv.meta";
import s from "./cctv.module.css";
import { CCTV_TEXT as T } from "./cctv.text";

/** Tiga ubin gaya APBDes/Monev: jumlah titik (+ cakupan peta), kamera online, kamera offline. */
export function CctvSummary({ summary }: { summary: Summary }) {
  const missing = summary.total - summary.mapped;
  const mapNote =
    summary.mapped === 0 ? T.noneMapped : missing === 0 ? T.allMapped : T.partlyMapped(summary.mapped, missing);

  return (
    <div className={s.summaryWrap}>
      <div className={s.summary}>
        <SummaryCard icon={IconDeviceCctv} label={T.totalLabel} vars={BRAND_ACCENT_VARS}>
          <p className={apb.amount}>
            {summary.total}
            <span className={s.unit}>{T.totalUnit}</span>
          </p>
          <p className={s.foot}>
            {mapNote}
            {summary.unknown > 0 ? <span className={s.footLine}>{T.unknownCount(summary.unknown)}</span> : null}
          </p>
        </SummaryCard>
        <StatusCard icon={IconVideo} label={T.onlineLabel} count={summary.online} vars={statusVars("online")} />
        <StatusCard icon={IconVideoOff} label={T.offlineLabel} count={summary.offline} vars={statusVars("offline")} />
      </div>
      <p className={apb.note}>{T.statusNote}</p>
    </div>
  );
}

type StatusCardProps = { icon: Icon; label: string; count: number; vars: CSSProperties };

/** Kartu status: ikon + label + jumlah kamera saja (tanpa persen/bar, keputusan user). */
function StatusCard({ icon, label, count, vars }: StatusCardProps) {
  return (
    <SummaryCard icon={icon} label={label} vars={vars} small>
      <p className={`${apb.amount} ${s.smallAmount}`}>
        {count}
        <span className={s.unit}>{T.cameraUnit}</span>
      </p>
    </SummaryCard>
  );
}

type CardProps = { icon: Icon; label: string; vars: CSSProperties; small?: boolean; children: ReactNode };

function SummaryCard({ icon: Icon, label, vars, small, children }: CardProps) {
  return (
    <article className={`${apb.card} ${small ? s.small : ""}`} style={vars}>
      <div className={apb.cardHead}>
        <span className={apb.icon} aria-hidden>
          <Icon size={22} stroke={1.75} />
        </span>
        <h2 className={`${apb.label} ${s.cardLabel}`}>{label}</h2>
      </div>
      {children}
    </article>
  );
}
