'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, paginate, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { ProgramTiles, ProgramTilesPlaceholder } from '@/app/(public)/_com/program-tiles/ProgramTiles';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import { useSearchParams } from 'next/navigation';
import { filterPenghijauan, penghijauanEmptyMessage, penghijauanListHref, type Penghijauan } from './penghijauan.logic';
import { PENGHIJAUAN_PAGE_SIZE } from './penghijauan.meta';
import { loadPenghijauanList } from './penghijauan.source';
import { PENGHIJAUAN_TEXT as T } from './penghijauan.text';

const LIST_TITLE_ID = 'penghijauan-list-title';
const PLACEHOLDER_TILES = 6;

/**
 * Halaman Program Penghijauan di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila program > 6 atau
 * sedang mencari), lalu ubin program tanpa foto (muat sekali, saring & paginasi `?page=` di klien).
 */
export function PenghijauanPage() {
  const nav = useListQueryNav();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useLoadOnce(loadPenghijauanList, 'program penghijauan (Program Penghijauan)');
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
        onSearch={(next) => nav.replaceQuery(penghijauanListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <PenghijauanBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => nav.pushPage(penghijauanListHref({ search, page: next }), LIST_TITLE_ID)}
      />
    </div>
  );
}

type BodyProps = {
  state: LoadState<Penghijauan[]>;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Ubin + paginasi untuk satu keadaan muat (diekspor untuk test). Judul bagian hanya untuk pembaca layar. */
export function PenghijauanBody({ state, search, page, onPage }: BodyProps) {
  const matches = state.status === 'ready' ? filterPenghijauan(state.data, search) : [];
  const current = paginate(matches, page, PENGHIJAUAN_PAGE_SIZE);
  const empty = state.status !== 'loading' && current.items.length === 0;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {state.status === 'loading' ? <ProgramTilesPlaceholder count={PLACEHOLDER_TILES} label={T.loading} /> : null}
      {empty ? <p className={kabar.empty}>{penghijauanEmptyMessage(search, state.status === 'error')}</p> : null}
      {current.items.length > 0 ? (
        <>
          <ProgramTiles items={current.items} label={T.listLabel} moreLabel={T.selengkapnya} />
          <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
        </>
      ) : null}
    </section>
  );
}
