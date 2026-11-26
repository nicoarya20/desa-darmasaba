'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { LIST_SEARCH_THRESHOLD } from '@/app/(public)/_com/kabar-list/kabar-list.meta';
import { outOfRangePage, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { PRODUK_HUKUM_DEFAULT_LIMIT } from '@/lib/produk-hukum';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ProdukHukumBody } from './ProdukHukumBody';
import {
  parseKategoriParam,
  PRODUK_HUKUM_LIST_ID,
  produkHukumHref,
  produkHukumTabs,
  type ProdukHukumFilter,
} from './produk-hukum.logic';
import { PRODUK_HUKUM_TEXT as T } from './produk-hukum.text';
import { useProdukHukumList } from './use-produk-hukum';

/**
 * Halaman publik Produk Hukum di `.section` Kabar Desa: kepala (judul, cari `?search=` bila entri > 6 atau sedang
 * mencari, pil kategori `?kategori=`), lalu tabel dengan paginasi `?page=` (disaring dan dipaginasi di server).
 * Tanpa entri sama sekali pil kategori disembunyikan; hanya pesan "Belum ada produk hukum".
 */
export function ProdukHukumPage() {
  const nav = useListQueryNav();
  const searchParams = useSearchParams();
  const filter: ProdukHukumFilter = {
    kategori: parseKategoriParam(searchParams.get('kategori')),
    search: searchParams.get('search')?.trim() ?? '',
    page: parsePage(searchParams.get('page')),
  };
  const { state, knownTotal } = useProdukHukumList({ ...filter, limit: PRODUK_HUKUM_DEFAULT_LIMIT });

  // ?page melewati halaman terakhir padahal ada entri (tautan lama): pindah ke halaman terakhir yang valid. Baris lama
  // yang masih tampil selama memuat (refreshing) bukan milik ?page ini, jadi belum dinilai.
  const lastPage = state.status === 'ready' && state.refreshing ? null : outOfRangePage(state, filter.page);
  const { kategori, search } = filter;
  useEffect(() => {
    if (lastPage) nav.replaceQuery(produkHukumHref({ kategori, search, page: lastPage }));
  }, [lastPage, kategori, search, nav]);

  const noEntries = state.status === 'ready' && state.total === 0 && !kategori && !search;
  const searchable = search !== '' || (knownTotal !== null && knownTotal > LIST_SEARCH_THRESHOLD);

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={noEntries ? [] : produkHukumTabs(kategori, search)}
        search={search}
        onSearch={(next) => nav.replaceQuery(produkHukumHref({ kategori, search: next }))}
        searchable={searchable}
      />
      <ProdukHukumBody
        state={state}
        filter={filter}
        limit={PRODUK_HUKUM_DEFAULT_LIMIT}
        onPage={(page) => nav.pushPage(produkHukumHref({ kategori, search, page }), PRODUK_HUKUM_LIST_ID)}
      />
    </div>
  );
}
