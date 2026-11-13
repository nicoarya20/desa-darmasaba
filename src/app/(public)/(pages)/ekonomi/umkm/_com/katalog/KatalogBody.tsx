'use client';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { KATALOG_DRAWER_QUERY } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import { clearFilters, emptyParams, type KatalogParams } from './katalog-params.logic';
import { buildKatalogView, type KatalogView } from './katalog-view.logic';
import { KatalogEmpty } from './KatalogEmpty';
import { KatalogGrid } from './KatalogGrid';
import s from './katalog-layout.module.css';
import { KatalogToolbar } from './KatalogToolbar';
import { KATALOG_PANEL_ID, katalogTabId } from './KatalogTabs';
import { ProdukCard } from './ProdukCard';
import { SaringDrawer } from './SaringDrawer';
import { SaringPanel, type KatalogUpdate } from './SaringPanel';
import type { KatalogData } from './use-katalog-data';
import { TokoCard } from './TokoCard';

type Props = {
  state: LoadState<KatalogData>;
  params: KatalogParams;
  update: KatalogUpdate;
  onRetry: () => void;
};

const LIST_TITLE_ID = 'katalog-list-title';

/** Badan katalog tab aktif: panel saring kiri (desktop) / drawer (≤1068px), baris alat, lalu grid kartu. */
export function KatalogBody({ state, params, update, onRetry }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const narrow = useMediaQuery(KATALOG_DRAWER_QUERY);
  // Layar dilebarkan melewati 1068px saat drawer terbuka → tutup (panel kiri sudah tampil). `narrow` baru terbaca
  // setelah mount, tetapi drawer hanya bisa dibuka lewat pil Saring yang tampil di layar sempit (sesudah terbaca).
  if (drawerOpen && !narrow) setDrawerOpen(false);
  const view = useMemo(() => (state.status === 'ready' ? buildKatalogView(state.data, params) : null), [state, params]);
  const p = view?.params ?? params;
  const facets = view?.facets ?? null;
  const clearAll = () => update(clearFilters);

  return (
    <div className={s.body} id={KATALOG_PANEL_ID} role="tabpanel" aria-labelledby={katalogTabId(params.tab)}>
      <aside className={s.aside}>
        <SaringPanel params={p} facets={facets} update={update} withTitle />
      </aside>
      <section className={s.main} aria-labelledby={LIST_TITLE_ID}>
        <h2 id={LIST_TITLE_ID} className={s.srOnly}>
          {T.listTitle[params.tab]}
        </h2>
        {state.status === 'error' ? (
          <KatalogEmpty title={T.errorTitle} description={T.errorDesc} actionLabel={T.retry} onAction={onRetry} />
        ) : (
          <>
            <KatalogToolbar
              tab={params.tab}
              count={view ? { shown: view.items.length, total: view.total } : null}
              urut={p.urut}
              onUrut={(urut) => update((cur) => ({ ...cur, urut }))}
              chips={view?.chips ?? []}
              activeCount={view?.activeCount ?? 0}
              onApply={(next) => update(() => next)}
              onClearAll={clearAll}
              onOpenSaring={() => setDrawerOpen(true)}
            />
            <KatalogGrid
              variant={params.tab}
              loading={view === null}
              empty={view ? <EmptyState view={view} onReset={() => update((cur) => emptyParams(cur.tab))} /> : null}
            >
              {view ? cardsOf(view) : null}
            </KatalogGrid>
          </>
        )}
      </section>
      <SaringDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tab={params.tab}
        params={p}
        facets={facets}
        update={update}
        shown={view?.items.length ?? 0}
        onClearAll={clearAll}
      />
    </div>
  );
}

/**
 * Kartu hasil sebagai larik (bukan komponen pembungkus): KatalogGrid menghitung anak untuk mendeteksi kosong dan
 * membungkus tiap kartu dengan <li>.
 */
function cardsOf(view: KatalogView) {
  return view.tab === 'produk'
    ? view.items.map((produk) => <ProdukCard key={produk.id} produk={produk} />)
    : view.items.map((toko) => <TokoCard key={toko.id} toko={toko} jumlahProduk={view.jumlahProduk.get(toko.id) ?? 0} />);
}

/** Data memang kosong vs. hasil saring/kata kunci kosong (aksi mengosongkan kata kunci & saringan). */
function EmptyState({ view, onReset }: { view: KatalogView; onReset: () => void }) {
  if (view.total === 0) return <KatalogEmpty title={T.emptyData[view.tab]} description={T.emptyDataDesc} />;
  return (
    <KatalogEmpty
      title={T.emptyFiltered[view.tab]}
      description={T.emptyFilteredDesc}
      actionLabel={T.emptyFilteredAction}
      onAction={onReset}
    />
  );
}
