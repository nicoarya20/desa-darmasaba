import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import {
  IconAlertTriangle, IconBabyCarriage, IconHeart, IconSalad, IconStethoscope, IconVaccine, type Icon,
} from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { formatHitungan, persenTampil, targetStuntingTampil, type PosyanduStats } from "./posyandu.logic";
import { ACCENT } from "./posyandu.meta";
import s from "./posyandu.module.css";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { PosyanduNotice, PosyanduSkeleton } from "./PosyanduStates";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";

const TITLE_ID = "posyandu-ringkasan-title";

/** Tab Ringkasan: 3 ubin hitungan + 3 ubin persentase (gaya kartu APBDes), angka seluruh desa. */
export function RingkasanPanel({ state, onRetry }: { state: LoadState<PosyanduStats>; onRetry: () => void }) {
  if (state.status === "error") return <PosyanduNotice message={T.statsFailed} onRetry={onRetry} />;
  if (state.status !== "ready") return <PosyanduSkeleton label={T.statsLoading} count={6} height={200} grid />;
  return <RingkasanContent stats={state.data} />;
}

/** Isi ringkasan (dipisah agar bisa dites tanpa memuat data). */
export function RingkasanContent({ stats }: { stats: PosyanduStats }) {
  const balita = stats.balitaTerdaftar;
  const target = targetStuntingTampil(stats.targetStuntingPct);
  return (
    <section aria-labelledby={TITLE_ID} className={s.panelBody}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {T.tabRingkasan}
      </h2>
      <div className={s.summary}>
        <CountCard icon={IconHeart} accent={ACCENT.brand} label={T.ibuHamilLabel} value={stats.ibuHamilAktif} unit={T.orangUnit} note={T.ibuHamilNote} />
        <CountCard icon={IconBabyCarriage} accent={ACCENT.teal} label={T.balitaLabel} value={balita} unit={T.balitaUnit} note={T.balitaNote} />
        <CountCard
          icon={IconAlertTriangle}
          accent={ACCENT.orange}
          label={T.alertLabel}
          value={stats.alertStunting}
          unit={T.balitaUnit}
          note={T.alertNote}
        >
          {target !== null ? (
            <p className={s.target}>
              <span>{T.targetLabel}</span>
              <strong>{target.toLocaleString("id-ID")}%</strong>
            </p>
          ) : null}
        </CountCard>
      </div>
      <div className={s.summary}>
        <PctCard icon={IconVaccine} label={T.imunisasiLabel} pct={stats.imunisasiLengkapPct} balita={balita} />
        <PctCard icon={IconSalad} label={T.giziLabel} pct={stats.giziBaikPct} balita={balita} />
        <PctCard icon={IconStethoscope} label={T.pemeriksaanLabel} pct={stats.pemeriksaanRutinPct} balita={balita} />
      </div>
      <p className={s.privacy}>{T.privacyNote}</p>
    </section>
  );
}

type CardProps = { icon: Icon; accent: CSSProperties; label: string; children: ReactNode };

function Card({ icon: Icon, accent, label, children }: CardProps) {
  return (
    <article className={apb.card} style={accent}>
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

type CountCardProps = Omit<CardProps, "children"> & { value: number; unit: string; note?: string; children?: ReactNode };

function CountCard({ value, unit, note, children, ...card }: CountCardProps) {
  return (
    <Card {...card}>
      <p className={apb.amount}>
        {formatHitungan(value)}
        <span className={s.unit}>{unit}</span>
      </p>
      {note ? <p className={s.foot}>{note}</p> : null}
      {children}
    </Card>
  );
}

function PctCard({ icon, label, pct, balita }: { icon: Icon; label: string; pct: number; balita: number }) {
  const shown = persenTampil(pct, balita);
  return (
    <Card icon={icon} accent={ACCENT.brand} label={label}>
      {shown.kind === "pct" ? (
        <>
          <p className={apb.amount}>{shown.value}%</p>
          <p className={s.foot}>{T.pctNote}</p>
          <div className={apb.bar} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={shown.value}>
            <span className={apb.barFill} style={{ width: `${shown.value}%` }} />
          </div>
        </>
      ) : (
        <>
          <p className={`${apb.amount} ${s.amountEmpty}`}>{shown.kind === "sedikit" ? T.pctTooFew : T.pctNoData}</p>
          <p className={s.foot}>{shown.kind === "sedikit" ? T.pctTooFewNote : T.pctNoDataNote}</p>
        </>
      )}
    </Card>
  );
}
