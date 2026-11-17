import { StatBarsPanel } from "@/app/(public)/_com/stat-bars/StatBarsPanel";
import type { DataPendidikanSummary } from "./data-pendidikan.logic";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";

/** Panel: judul + total di kepala, lalu daftar batang horizontal satu warna (urut jenjang). */
export function DataPendidikanPanel({ summary }: { summary: DataPendidikanSummary }) {
  const { total, belumDiisi } = summary;
  return (
    <StatBarsPanel
      titleId="data-pendidikan-panel-title"
      title={T.panelTitle}
      caption={T.panelCaption}
      summary={summary}
      unit={T.unit}
      totalLabel={T.totalLabel}
      notFilledLabel={T.notFilled}
      footnote={belumDiisi > 0 && total !== null ? T.notFilledNote(belumDiisi) : undefined}
    />
  );
}
