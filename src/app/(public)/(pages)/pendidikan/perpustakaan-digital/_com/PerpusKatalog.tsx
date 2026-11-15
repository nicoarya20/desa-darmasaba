'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import s from './perpus-katalog.module.css';
import { PerpusDaftar } from './PerpusDaftar';
import { usePerpusData } from './PerpusDataProvider';
import { normalizeSlug, parseUrut, perpusListHref, perpusTabs } from './perpus-katalog.logic';
import { PERPUS_BRAND_VARS } from './perpus.meta';
import { PERPUS_TEXT as T } from './perpus.text';

/**
 * Katalog Perpustakaan Digital (`/pendidikan/perpustakaan-digital/{semua|kategori}`): kepala Kabar (kembali, judul,
 * cari `?search=`, pil kategori), baris jumlah + Urutkan (`?urut=`), lalu grid kartu buku. Data dari layout.
 */
export function PerpusKatalog({ slugParam }: { slugParam: string }) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const { state, retry } = usePerpusData();
  const slug = normalizeSlug(slugParam);
  const search = searchParams.get('search')?.trim() ?? '';
  const urut = parseUrut(searchParams.get('urut'));
  const buku = useMemo(() => (state.status === 'ready' ? state.data : []), [state]);
  const tabs = useMemo(
    () => perpusTabs(buku, slug, { search, urut, semuaLabel: T.semua }),
    [buku, slug, search, urut],
  );

  return (
    <div className={s.page} style={PERPUS_BRAND_VARS}>
      <div className={s.inner}>
        <KabarListHeader
          title={T.title}
          lead={T.lead}
          searchLabel={T.searchLabel}
          searchPlaceholder={T.searchPlaceholder}
          kategoriLabel={T.kategoriLabel}
          tabs={tabs}
          search={search}
          onSearch={(next) => router.replace(perpusListHref(slug, { search: next, urut }))}
        />
        <PerpusDaftar
          state={state}
          slug={slug}
          search={search}
          urut={urut}
          onUrut={(next) => router.replace(perpusListHref(slug, { search, urut: next }))}
          onClearSearch={() => router.replace(perpusListHref(slug, { urut }))}
          onRetry={retry}
        />
      </div>
    </div>
  );
}
