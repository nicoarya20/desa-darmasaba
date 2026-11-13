import { formatHitungan, persenTampil, type BanjarStatsRow, type PersenKey, type PosyanduStats } from "./posyandu.logic";
import { banjarLabel } from "./posyandu.logic";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { BanjarStatsPanel, type BanjarStatsData } from "./BanjarStatsPanel";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import r from "./posyandu-rows.module.css";

const COLUMNS: { key: PersenKey; label: string }[] = [
  { key: "imunisasiLengkapPct", label: T.imunisasiLabel },
  { key: "giziBaikPct", label: T.giziLabel },
  { key: "pemeriksaanRutinPct", label: T.pemeriksaanLabel },
];

type Props = { desa: LoadState<PosyanduStats>; banjar: LoadState<BanjarStatsRow[]>; onRetry: () => void };

/** Tab Balita: tabel angka gabungan per banjar (tanpa nama anak), baris pertama = seluruh desa. */
export function BalitaPanel(props: Props) {
  return (
    <BanjarStatsPanel titleId="posyandu-balita-title" title={T.balitaTitle} lead={T.balitaLead} unassignedKey="balitaTerdaftar" {...props}>
      {(data) => <BalitaTable {...data} />}
    </BanjarStatsPanel>
  );
}

/** Tabel balita per banjar (dipisah agar bisa dites tanpa memuat data). */
export function BalitaTable({ desa, rows }: BanjarStatsData) {
  return (
    <div className={r.table}>
      <div className={`${r.statRow} ${r.statHead}`} aria-hidden>
        <span>{T.colBanjar}</span>
        <span>{T.balitaLabel}</span>
        <span>{T.alertLabel}</span>
        {COLUMNS.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      <ul className={r.statList}>
        <BalitaRow name={T.desaRow} stats={desa} total />
        {rows.map((row) => (
          <BalitaRow key={row.id} name={banjarLabel(row.name)} stats={row.stats} />
        ))}
      </ul>
    </div>
  );
}

function BalitaRow({ name, stats, total }: { name: string; stats: PosyanduStats | null; total?: boolean }) {
  return (
    <li className={`${r.statRow} ${total ? r.statTotal : ""}`}>
      <span className={r.statName}>{name}</span>
      {stats ? (
        <>
          <Cell label={T.balitaLabel} value={formatHitungan(stats.balitaTerdaftar)} />
          <Cell label={T.alertLabel} value={formatHitungan(stats.alertStunting)} />
          {COLUMNS.map((c) => (
            <Cell key={c.key} label={c.label} value={pctText(stats[c.key], stats.balitaTerdaftar)} />
          ))}
        </>
      ) : (
        <span className={`${r.statFailed} ${r.kosong}`}>{T.rowFailed}</span>
      )}
    </li>
  );
}

function pctText(pct: number, balita: number): string {
  const shown = persenTampil(pct, balita);
  if (shown.kind === "pct") return `${shown.value}%`;
  return shown.kind === "sedikit" ? T.pctFewShort : T.pctNoneShort;
}

/** Sel angka: label tersembunyi di desktop (kepala kolom), tampil di ponsel. */
function Cell({ label, value }: { label: string; value: string }) {
  const empty = !/\d/.test(value);
  return (
    <span className={r.cell}>
      <span className={r.cellLabel}>{label}</span>
      <span className={`${r.cellValue} ${empty ? r.kosong : ""}`}>{value}</span>
    </span>
  );
}
