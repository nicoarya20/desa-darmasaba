'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { Suspense } from 'react';
import { KatalogBody } from './_com/katalog/KatalogBody';
import { KATALOG_BRAND_VARS } from './_com/katalog/katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './_com/katalog/katalog-filter.text';
import s from './_com/katalog/katalog-layout.module.css';
import { switchTab } from './_com/katalog/katalog-params.logic';
import { KatalogTabs } from './_com/katalog/KatalogTabs';
import { useKatalogData } from './_com/katalog/use-katalog-data';
import { useKatalogParams } from './_com/katalog/use-katalog-params';

/**
 * Katalog UMKM publik (`/ekonomi/umkm`): kepala + cari (`?q=`), tab Produk | Toko (`?tab=`), panel saring kiri
 * (drawer di ≤1068px), baris alat, dan grid kartu. Data dimuat sekali lalu disaring di klien (lihat katalog-filter.meta.ts).
 */
function KatalogPage() {
  const { params, update } = useKatalogParams();
  const { state, retry } = useKatalogData();

  return (
    <div className={s.page} style={KATALOG_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel[params.tab]}
        searchPlaceholder={T.searchLabel[params.tab]}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search={params.q}
        onSearch={(q) => update((current) => ({ ...current, q }))}
      />
      <KatalogTabs value={params.tab} onChange={(tab) => update((current) => switchTab(current, tab))} />
      <KatalogBody state={state} params={params} update={update} onRetry={retry} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <KatalogPage />
    </Suspense>
  );
}
