'use client';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { KatalogEmpty } from '../../umkm/_com/katalog/KatalogEmpty';
import { FilterDrawer } from './FilterDrawer';
import { FilterPanel } from './FilterPanel';
import { LOWONGAN_DRAWER_QUERY } from './lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import { clearAll, clearFilters, type LowonganParams, type LowonganUpdate } from './lowongan-params.logic';
import { buildLowonganView, type LowonganView } from './lowongan-view.logic';
import type { Lowongan } from './lowongan.types';
import { LowonganCard } from './LowonganCard';
import s from './lowongan-layout.module.css';
import { LowonganList } from './LowonganList';
import { LowonganToolbar } from './LowonganToolbar';

type Props = {
  state: LoadState<Lowongan[]>;
  params: LowonganParams;
  update: LowonganUpdate;
  onRetry: () => void;
};

/** Badan halaman lowongan: panel Filter kiri (desktop) / drawer (≤1068px), baris alat, lalu daftar kartu. */
export function LowonganBody({ state, params, update, onRetry }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Waktu acuan filter Waktu tayang, diambil sekali: jumlah "N hari terakhir" tidak bergeser selama halaman terbuka.
  const [now] = useState(() => Date.now());
  const narrow = useMediaQuery(LOWONGAN_DRAWER_QUERY);
  // Layar dilebarkan melewati 1068px saat drawer terbuka → tutup (panel kiri sudah tampil). `narrow` baru terbaca
  // setelah mount, tetapi drawer hanya bisa dibuka lewat pil Filter yang tampil di layar sempit (sesudah terbaca).
  if (drawerOpen && !narrow) setDrawerOpen(false);
  const view = useMemo(
    () => (state.status === 'ready' ? buildLowonganView(state.data, params, now) : null),
    [state, params, now],
  );
  const p = view?.params ?? params;
  const facets = view?.facets ?? null;
  const chips = view?.chips ?? [];
  const onClearAll = () => update(clearFilters);

  return (
    <div className={s.body}>
      <aside className={s.aside}>
        <FilterPanel params={p} facets={facets} chips={chips} update={update} onClearAll={onClearAll} />
      </aside>
      <section className={s.main} aria-label={T.listTitle}>
        {state.status === 'error' ? (
          <KatalogEmpty title={T.errorTitle} description={T.errorDesc} actionLabel={T.retry} onAction={onRetry} />
        ) : (
          <>
            <LowonganToolbar
              count={view ? { shown: view.items.length, total: view.total } : null}
              urut={p.urut}
              onUrut={(urut) => update((cur) => ({ ...cur, urut }))}
              chips={chips}
              activeCount={view?.activeCount ?? 0}
              onApply={(next) => update(() => next)}
              onClearAll={onClearAll}
              onOpenFilter={() => setDrawerOpen(true)}
            />
            <LowonganList loading={view === null} empty={view ? <EmptyState view={view} onReset={() => update(clearAll)} /> : null}>
              {view ? view.items.map((lowongan) => <LowonganCard key={lowongan.id} lowongan={lowongan} />) : null}
            </LowonganList>
          </>
        )}
      </section>
      <FilterDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        params={p}
        facets={facets}
        chips={chips}
        update={update}
        shown={view?.items.length ?? 0}
        onClearAll={onClearAll}
      />
    </div>
  );
}

/** Data memang kosong vs. hasil filter/kata kunci kosong (aksi mengosongkan filter dan kata kunci). */
function EmptyState({ view, onReset }: { view: LowonganView; onReset: () => void }) {
  if (view.total === 0) return <KatalogEmpty title={T.emptyData} description={T.emptyDataDesc} />;
  return (
    <KatalogEmpty
      title={T.emptyFiltered}
      description={T.emptyFilteredDesc}
      actionLabel={T.emptyFilteredAction}
      onAction={onReset}
    />
  );
}
