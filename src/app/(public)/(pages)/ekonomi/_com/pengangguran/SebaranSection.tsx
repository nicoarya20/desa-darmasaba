import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { summarizeStatBars } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import type { Sebaran } from './pengangguran.logic';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

type Props = { id: string; title: string; state: LoadState<Sebaran | null> };

/**
 * Satu sebaran (usia atau pendidikan) dalam panel stat-bars, urutan kelompok tetap (bukan peringkat).
 * Kosong (belum ada baris / semua kelompok belum diisi) → ubin "akan tampil di sini" dengan judul bagian tetap terbaca.
 */
export function SebaranSection({ id, title, state }: Props) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.usia.loading(title)} rows={5} />;
  if (state.status === 'error') return <StatBarsError message={T.usia.error(title)} />;

  const summary = state.data ? summarizeStatBars(state.data.items) : null;
  if (!summary || summary.total === null) return <StatBarsEmpty title={title} body={T.usia.empty(title)} />;

  return (
    <section aria-labelledby={id}>
      <StatBarsPanel
        titleId={id}
        title={title}
        meta={summary.latest ? T.diperbarui(formatTanggal(summary.latest)) : undefined}
        summary={summary}
        unit={T.orang}
        totalLabel={T.total}
        notFilledLabel={T.belumDiisi}
      />
    </section>
  );
}
