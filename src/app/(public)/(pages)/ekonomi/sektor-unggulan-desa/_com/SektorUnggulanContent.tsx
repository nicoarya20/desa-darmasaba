import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { SektorDetails } from './SektorDetails';
import { SektorRanking } from './SektorRanking';
import { summarizeSektor, type Sektor } from './sektor-unggulan.logic';
import { SEKTOR_UNGGULAN_TEXT as T } from './sektor-unggulan.text';

/**
 * Isi halaman per keadaan muat (diekspor untuk test): kerangka panel berdenyut, galat ≠ kosong (kalimat berbeda,
 * galat ber-`role="alert"`), atau panel peringkat + rincian deskripsi (hanya bila ada sektor berdeskripsi).
 */
export function SektorUnggulanContent({ state }: { state: LoadState<Sektor[]> }) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.loading} />;
  if (state.status === 'error') return <StatBarsError message={T.error} />;
  if (state.data.length === 0) return <StatBarsEmpty body={T.empty} />;

  const summary = summarizeSektor(state.data);
  return (
    <>
      <SektorRanking summary={summary} />
      <SektorDetails summary={summary} />
    </>
  );
}
