import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import type { SektorBar, SektorSummary } from './sektor-unggulan.logic';
import { SEKTOR_UNGGULAN_TEXT as T } from './sektor-unggulan.text';

const TITLE_ID = 'sektor-unggulan-ranking-title';

/**
 * Panel peringkat (modul bersama stat-bars): angka polos dari CMS tanpa persen dan tanpa satuan karangan.
 * Satuan antarsektor berbeda → tanpa batang, angka + satuan per baris.
 */
export function SektorRanking({ summary }: { summary: SektorSummary }) {
  const { stat, comparable, unit, periode } = summary;
  const meta = [periode ? T.periode(periode) : null, stat.latest ? T.updated(formatTanggal(stat.latest)) : null]
    .filter(Boolean)
    .join(' · ');
  return (
    <StatBarsPanel<SektorBar>
      titleId={TITLE_ID}
      title={T.rankingTitle}
      caption={comparable ? T.rankingCaption(unit) : T.rankingCaptionMixed}
      meta={meta || undefined}
      summary={stat}
      showShare={false}
      showBars={comparable}
      notFilledLabel={T.notFilled}
      footnote={stat.belumDiisi > 0 ? T.notFilledNote(stat.belumDiisi) : undefined}
    />
  );
}
