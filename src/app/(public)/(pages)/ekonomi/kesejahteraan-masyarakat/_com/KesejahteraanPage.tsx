'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { KesejahteraanCards, KesejahteraanPlaceholder } from './KesejahteraanCards';
import { KesejahteraanSorotan } from './KesejahteraanSorotan';
import { ProgramKemiskinanLink } from './ProgramKemiskinanLink';
import {
  arrangeKesejahteraan,
  kesejahteraanEmptyMessage,
  kesejahteraanListHref,
  type KesejahteraanItem,
} from './kesejahteraan.logic';
import { KESEJAHTERAAN_PAGE_SIZE } from './kesejahteraan.meta';
import s from './kesejahteraan.module.css';
import { loadKesejahteraanList } from './kesejahteraan.source';
import { KESEJAHTERAAN_TEXT as T } from './kesejahteraan.text';

const LIST_TITLE_ID = 'kesejahteraan-list-title';

/**
 * Halaman Kesejahteraan Masyarakat di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila entri > 6
 * atau sedang mencari), sorotan program terbaru (halaman 1 tanpa kata kunci), kartu program lainnya (`?page=`), lalu
 * tautan silang ke Program Pengentasan Kemiskinan. Muat sekali; saring & paginasi di klien.
 */
export function KesejahteraanPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useLoadOnce(loadKesejahteraanList, 'program kesejahteraan (Kesejahteraan Masyarakat)');
  const total = state.status === 'ready' ? state.data.length : null;

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search={search}
        onSearch={(next) => router.replace(kesejahteraanListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <div className={s.stack}>
        <KesejahteraanBody
          state={state}
          search={search}
          page={page}
          onPage={(next) => router.push(kesejahteraanListHref({ search, page: next }))}
        />
        <ProgramKemiskinanLink />
      </div>
    </div>
  );
}

type BodyProps = {
  state: LoadState<KesejahteraanItem[]>;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Sorotan + kartu + paginasi untuk satu keadaan muat (diekspor untuk test). */
export function KesejahteraanBody({ state, search, page, onPage }: BodyProps) {
  if (state.status === 'loading') {
    return <KesejahteraanPlaceholder sorotan={!search && page === 1} cards={KESEJAHTERAAN_PAGE_SIZE} />;
  }
  const view =
    state.status === 'ready' ? arrangeKesejahteraan(state.data, { search, page, size: KESEJAHTERAAN_PAGE_SIZE }) : null;
  if (!view || (!view.sorotan && view.cards.length === 0)) {
    return <p className={kabar.empty}>{kesejahteraanEmptyMessage(search, state.status === 'error')}</p>;
  }

  return (
    <div className={s.stack}>
      {view.sorotan ? <KesejahteraanSorotan item={view.sorotan} /> : null}
      {view.cards.length > 0 ? (
        <section className={s.block} aria-labelledby={LIST_TITLE_ID}>
          <h2 id={LIST_TITLE_ID} className={s.blockTitle}>
            {search ? T.searchListLabel : T.listLabel}
          </h2>
          <KesejahteraanCards items={view.cards} />
          <KabarListPagination total={view.totalPages} value={view.page} label={T.paginationLabel} onChange={onPage} />
        </section>
      ) : null}
    </div>
  );
}
