import { formatTanggal } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { StatBarsPanel } from "@/app/(public)/_com/stat-bars/StatBarsPanel";
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from "@/app/(public)/_com/stat-bars/StatBarsStates";
import { formatJumlah, summarizeStatBars } from "@/app/(public)/_com/stat-bars/stat-bars.logic";
import { IconUsers } from "@tabler/icons-react";
import type { DatasetSlice } from "../data/kependudukan-data.types";
import { banjarTotals, parseBanjarRows, toBanjarBars, type BanjarBar } from "./banjar.logic";
import { BANJAR_TEXT as T } from "./banjar.text";

const TITLE_ID = "kependudukan-banjar-title";
const SKELETON_ROWS = 6;

/**
 * Section `#banjar` Dashboard Kependudukan: penduduk per banjar untuk tahun terbaru dataset (bukan tahun berjalan),
 * batang urut terbanyak, total jiwa + KK di kepala, KK per banjar di bawah nama. Judul `h2` ada di semua keadaan.
 */
export function BanjarSection({ data }: { data: DatasetSlice }) {
  return (
    <section id={T.anchor} aria-labelledby={TITLE_ID}>
      <BanjarBody data={data} />
    </section>
  );
}

function BanjarBody({ data }: { data: DatasetSlice }) {
  if (data.status === "loading") {
    return <StatBarsSkeleton title={T.title} titleId={TITLE_ID} label={T.loading} rows={SKELETON_ROWS} />;
  }
  if (data.status === "error") {
    return <StatBarsError title={T.title} titleId={TITLE_ID} message={T.error} onRetry={data.retry} />;
  }
  const rows = parseBanjarRows(data.rows);
  if (data.tahun === null || rows.length === 0) {
    return <StatBarsEmpty icon={<IconUsers size={24} stroke={1.75} />} title={T.title} titleId={TITLE_ID} body={T.empty} />;
  }

  const totals = banjarTotals(rows);
  const summary = summarizeStatBars<BanjarBar>(toBanjarBars(rows, totals.miskinTerisi, T));
  const notes = [
    summary.belumDiisi > 0 ? T.pendudukBelumDiisi(summary.belumDiisi) : null,
    totals.miskinTerisi ? T.miskinNote : T.miskinBelumDiisi,
  ].filter(Boolean);

  return (
    <StatBarsPanel<BanjarBar>
      titleId={TITLE_ID}
      title={T.title}
      caption={T.caption(data.tahun, rows.length)}
      meta={summary.latest ? T.updated(formatTanggal(summary.latest)) : undefined}
      summary={summary}
      unit={T.unit}
      totalLabel={T.totalLabel}
      totalDetail={totals.kk !== null ? T.totalKk(formatJumlah(totals.kk)) : undefined}
      footnote={notes.join(" ")}
    />
  );
}
