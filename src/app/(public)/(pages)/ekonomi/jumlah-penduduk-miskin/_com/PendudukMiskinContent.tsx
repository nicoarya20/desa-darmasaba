import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { summarizeStatBars } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { IconUsers } from '@tabler/icons-react';
import { PendudukMiskinSummary } from './PendudukMiskinSummary';
import { pickLatestTahun, toStatBarItems, type PendudukMiskinTahun } from './penduduk-miskin.logic';
import s from './penduduk-miskin.module.css';
import { PENDUDUK_MISKIN_TEXT as T } from './penduduk-miskin.text';

const PANEL_TITLE_ID = 'penduduk-miskin-panel-title';
const SKELETON_ROWS = 5;

/**
 * Isi halaman untuk satu keadaan muat: kerangka, galat, ubin kosong "tempat disediakan", atau kartu tahun terbaru +
 * batang per tahun (hanya bila > 1 tahun; satu tahun cukup kartunya). `rows` urut terbaru dulu.
 */
export function PendudukMiskinContent({ state }: { state: LoadState<PendudukMiskinTahun[]> }) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.loading} rows={SKELETON_ROWS} />;
  if (state.status === 'error') return <StatBarsError message={T.error} />;

  const latest = pickLatestTahun(state.data);
  if (!latest || latest.jumlah === null) {
    return <StatBarsEmpty icon={<IconUsers size={24} stroke={1.75} />} body={T.empty} />;
  }
  return (
    <div className={s.content}>
      <PendudukMiskinSummary rows={state.data} latest={{ ...latest, jumlah: latest.jumlah }} />
      {state.data.length > 1 ? (
        <StatBarsPanel
          titleId={PANEL_TITLE_ID}
          title={T.panelTitle}
          caption={T.panelCaption}
          summary={summarizeStatBars(toStatBarItems(state.data))}
          unit={T.orang}
          showShare={false}
        />
      ) : null}
    </div>
  );
}
