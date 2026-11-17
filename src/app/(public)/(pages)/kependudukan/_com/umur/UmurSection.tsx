import { formatPercent, formatTanggal } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { formatJumlah } from "@/app/(public)/_com/stat-bars/stat-bars.logic";
import { StatBarsPanel } from "@/app/(public)/_com/stat-bars/StatBarsPanel";
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from "@/app/(public)/_com/stat-bars/StatBarsStates";
import { IconUsersGroup } from "@tabler/icons-react";
import type { DatasetSlice } from "../data/kependudukan-data.types";
import { formatDesimal, parseUmurRows, summarizeUmur, umurTurunan, type UmurIssue, type UmurTurunan } from "./umur.logic";
import s from "./umur.module.css";
import { UMUR_TEXT as T } from "./umur.text";

export const UMUR_ANCHOR = "umur";
const TITLE_ID = "umur-panel-title";
/** Seukuran isian kelompok BPS (5 kelompok). */
const SKELETON_ROWS = 5;

/** Section `#umur`: batang kelompok umur urut umur untuk tahun terbaru; total/persen hanya bila kelompok saling lepas. */
export function UmurSection({ data }: { data: DatasetSlice }) {
  return (
    <section id={UMUR_ANCHOR} className={s.section} aria-labelledby={TITLE_ID}>
      <UmurContent data={data} />
    </section>
  );
}

function issueNote(issue: UmurIssue): string {
  return issue.kind === "tumpangTindih" ? T.overlapNote(issue.a, issue.b) : T.unreadNote(issue.label);
}

/** Isi per keadaan: kerangka, galat + coba lagi, ubin kosong, atau panel + angka turunan. */
function UmurContent({ data }: { data: DatasetSlice }) {
  if (data.status === "loading") return <StatBarsSkeleton title={T.title} titleId={TITLE_ID} label={T.loading} rows={SKELETON_ROWS} />;
  if (data.status === "error") return <StatBarsError title={T.title} titleId={TITLE_ID} message={T.failed} onRetry={data.retry} />;
  const rows = parseUmurRows(data.rows);
  if (data.tahun === null || rows.length === 0) {
    return <StatBarsEmpty icon={<IconUsersGroup size={24} stroke={1.75} />} title={T.title} titleId={TITLE_ID} body={T.emptyBody} />;
  }
  const { summary, issue } = summarizeUmur(rows);
  const notes = [
    issue ? issueNote(issue) : null,
    !issue && summary.belumDiisi > 0 && summary.total !== null ? T.notFilledNote(summary.belumDiisi) : null,
    !issue && summary.total !== null ? T.sourceNote : null,
  ].filter(Boolean);
  const turunan = umurTurunan(rows);
  return (
    <>
      <StatBarsPanel
        titleId={TITLE_ID}
        title={T.title}
        caption={T.caption}
        meta={T.meta(data.tahun, summary.latest ? formatTanggal(summary.latest) : null)}
        summary={summary}
        unit={T.unit}
        totalLabel={issue ? undefined : T.totalLabel}
        showShare={!issue}
        notFilledLabel={T.notFilled}
        footnote={notes.length > 0 ? notes.join(" ") : undefined}
      />
      {turunan ? <UmurTurunanTiles turunan={turunan} /> : null}
    </>
  );
}

/** Dua ubin: jumlah usia produktif (+ porsi) dan rasio ketergantungan. Hanya dirender bila `umurTurunan` tidak null. */
export function UmurTurunanTiles({ turunan }: { turunan: UmurTurunan }) {
  return (
    <ul className={s.tiles} aria-label={T.turunanLabel}>
      <li className={s.tile}>
        <span className={s.tileLabel}>{T.produktifLabel}</span>
        <span className={s.tileValue}>
          {formatJumlah(turunan.produktif)}
          <span className={s.tileUnit}>{T.unit}</span>
        </span>
        <span className={s.tileHint}>{T.produktifHint(formatPercent(turunan.persenProduktif))}</span>
      </li>
      <li className={s.tile}>
        <span className={s.tileLabel}>{T.rasioLabel}</span>
        <span className={s.tileValue}>{formatDesimal(turunan.rasio)}</span>
        <span className={s.tileHint}>{T.rasioHint(Math.round(turunan.rasio))}</span>
      </li>
    </ul>
  );
}
