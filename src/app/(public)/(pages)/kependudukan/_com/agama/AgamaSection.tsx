import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { summarizeStatBars } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { IconBuildingCommunity } from '@tabler/icons-react';
import type { DatasetSlice } from '../data/kependudukan-data.types';
import { compareAgama, formatAgamaShare, parseAgamaRows, toAgamaStatItems } from './agama.logic';
import { AGAMA_TEXT as T } from './agama.text';

/** Anchor section (navbar & rel pil melompat ke `#agama`). */
export const AGAMA_ANCHOR = 'agama';
const TITLE_ID = 'kependudukan-agama-title';
const SKELETON_ROWS = 6;

/**
 * Section Agama: batang horizontal per agama untuk tahun terbaru dataset (jumlah + persen angka asli, warna brand
 * tunggal), urut terbanyak dengan "Lainnya" di akhir. Judul `h2` ada di semua keadaan (tujuan `#agama`).
 * Galat ≠ kosong: galat = ubin + "Coba lagi"; kosong = ubin "belum diisi".
 * Visibilitas (saklar admin) diputuskan pemakai lewat `isAgamaHidden`, bukan di sini.
 */
export function AgamaSection({ data }: { data: DatasetSlice }) {
  return (
    <section id={AGAMA_ANCHOR} aria-labelledby={TITLE_ID}>
      <AgamaBody data={data} />
    </section>
  );
}

function AgamaBody({ data }: { data: DatasetSlice }) {
  const title = { title: T.title, titleId: TITLE_ID };
  if (data.status === 'loading') return <StatBarsSkeleton {...title} label={T.loading} rows={SKELETON_ROWS} />;
  if (data.status === 'error') return <StatBarsError {...title} message={T.error} onRetry={data.retry} />;

  const summary = summarizeStatBars(toAgamaStatItems(parseAgamaRows(data.rows)), { compare: compareAgama });
  if (data.tahun === null || summary.total === null) {
    return <StatBarsEmpty {...title} icon={<IconBuildingCommunity size={24} stroke={1.75} />} body={T.empty} />;
  }

  return (
    <StatBarsPanel
      {...title}
      caption={T.caption}
      meta={T.meta(data.tahun, summary.latest ? formatTanggal(summary.latest) : null)}
      summary={summary}
      unit={T.unit}
      totalLabel={T.totalLabel}
      formatShare={formatAgamaShare}
      footnote={T.sourceNote}
    />
  );
}
