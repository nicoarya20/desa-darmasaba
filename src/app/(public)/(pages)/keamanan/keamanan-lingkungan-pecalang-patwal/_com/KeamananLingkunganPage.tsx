'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useKabarPage, type KabarPageState } from '@/app/(public)/_com/kabar-list/use-kabar-page';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { keamananLingkunganListHref } from './keamanan-lingkungan.logic';
import { KEAMANAN_LINGKUNGAN_PAGE_LIMIT } from './keamanan-lingkungan.meta';
import { loadKeamananLingkunganPage } from './keamanan-lingkungan.source';
import { KEAMANAN_LINGKUNGAN_TEXT as T } from './keamanan-lingkungan.text';

const LIST_TITLE_ID = 'keamanan-lingkungan-list-title';

/**
 * Halaman Keamanan Lingkungan di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=`), lalu kartu gaya
 * Kegiatan Desa (1 utama + kartu kecil, `?page=`, paginasi server; paginasi disembunyikan bila 1 halaman).
 */
export function KeamananLingkunganPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useKabarPage(
    loadKeamananLingkunganPage,
    { page, limit: KEAMANAN_LINGKUNGAN_PAGE_LIMIT, search, kategori: '' },
    'keamanan lingkungan',
  );

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search={search}
        onSearch={(next) => router.replace(keamananLingkunganListHref({ search: next }))}
      />
      <KeamananLingkunganBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(keamananLingkunganListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: KabarPageState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Kartu untuk satu keadaan muat (diekspor untuk test). */
export function KeamananLingkunganBody({ state, search, page, onPage }: BodyProps) {
  const { items, totalPages, loading, failed } = state;
  const empty = !loading && items.length === 0;
  const emptyText = failed ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita
          items={items}
          loading={loading}
          layout="grid"
          placeholderCards={KEAMANAN_LINGKUNGAN_PAGE_LIMIT - 1}
          listLabel={T.cardsLabel}
          loadingLabel={T.loading}
        />
      )}
      {!empty ? <KabarListPagination total={totalPages} value={page} label={T.paginationLabel} onChange={onPage} /> : null}
    </section>
  );
}
