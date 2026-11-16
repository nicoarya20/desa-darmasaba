'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import s from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useKabarPage, type KabarPageState } from '@/app/(public)/_com/kabar-list/use-kabar-page';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { INOVASI_KATEGORI_LABEL } from '@/lib/inovasi-teknologi/kategori';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { inovasiListHref, inovasiTabs, parseInovasiParams, type InovasiParams } from './inovasi.logic';
import { INOVASI_PAGE_LIMIT } from './inovasi.meta';
import { loadInovasiPage } from './inovasi.source';
import { INOVASI_TEXT as T } from './inovasi.text';

const TITLE_ID = 'inovasi-list-title';

/**
 * Halaman Inovasi Teknologi Desa: kepala (kembali, judul, cari `?search=`, pil kategori `?kategori=`), lalu kartu gaya
 * Berita berpaginasi server (`?page=`). Gabungan halaman lama Desa Digital & Info Teknologi Tepat Guna.
 */
export function InovasiTeknologiPage() {
  const router = useTransitionRouter();
  const params = parseInovasiParams(useSearchParams());
  const { kategori, search, page } = params;
  const state = useKabarPage(loadInovasiPage, { page, limit: INOVASI_PAGE_LIMIT, search, kategori }, 'inovasi teknologi desa');

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={inovasiTabs(kategori, search)}
        search={search}
        onSearch={(next) => router.replace(inovasiListHref({ kategori, search: next }))}
      />
      <InovasiTeknologiBody
        state={state}
        params={params}
        onPage={(next) => router.push(inovasiListHref({ kategori, search, page: next }))}
      />
    </div>
  );
}

type BodyProps = { state: KabarPageState; params: InovasiParams; onPage: (page: number) => void };

/** Daftar kartu untuk satu keadaan muat (diekspor untuk test). */
export function InovasiTeknologiBody({ state, params, onPage }: BodyProps) {
  const { items, totalPages, loading, failed } = state;
  const empty = !loading && items.length === 0;
  const emptyText = failed
    ? T.error
    : params.search
      ? T.emptySearch(params.search)
      : params.kategori
        ? T.emptyKategori(INOVASI_KATEGORI_LABEL[params.kategori])
        : T.empty;

  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {T.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita
          items={items}
          loading={loading}
          layout="grid"
          placeholderCards={INOVASI_PAGE_LIMIT - 1}
          listLabel={T.cardsLabel}
          loadingLabel={T.loading}
        />
      )}
      {!empty ? <KabarListPagination total={totalPages} value={params.page} label={T.paginationLabel} onChange={onPage} /> : null}
    </section>
  );
}
