'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { paginate, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { ListRefreshRegion } from '@/app/(public)/_com/kabar-list/ListRefreshRegion';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useSearchParams } from 'next/navigation';
import { ProgramManfaat } from './ProgramManfaat';
import { programListHref } from './program.logic';
import { PROGRAM_PAGE_LIMIT } from './program.meta';
import s from './program.module.css';
import { PROGRAM_TEXT as T } from './program.text';
import { useProgramKesehatan, type ProgramKesehatanState } from './use-program-kesehatan';

const LIST_TITLE_ID = 'program-list-title';

/**
 * Halaman Program Kesehatan di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=`), kartu program gaya
 * Kegiatan Desa (`?page=`, dipaginasi di klien; entri indikator disaring), lalu "Manfaat Program Kesehatan".
 */
export function ProgramKesehatanPage() {
  const nav = useListQueryNav();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useProgramKesehatan(search);

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
        onSearch={(next) => nav.replaceSearch(programListHref({ search: next }))}
      />
      <ProgramKesehatanBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => nav.pushPage(programListHref({ search, page: next }), LIST_TITLE_ID)}
      />
      <ProgramManfaat />
    </div>
  );
}

type BodyProps = {
  state: ProgramKesehatanState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Daftar kartu program untuk satu keadaan muat (diekspor untuk test). */
export function ProgramKesehatanBody({ state, search, page, onPage }: BodyProps) {
  const loading = state.status === 'loading';
  const current = paginate(state.status === 'ready' ? state.kegiatan : [], page, PROGRAM_PAGE_LIMIT);
  const empty = !loading && current.items.length === 0;
  const emptyText = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section className={s.block} aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={s.blockTitle}>
        {T.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <ListRefreshRegion refreshing={state.status === 'ready' && state.refreshing}>
          <KabarBerita
            items={current.items}
            loading={loading}
            layout="grid"
            placeholderCards={PROGRAM_PAGE_LIMIT - 1}
            listLabel={T.cardsLabel}
            loadingLabel={T.loading}
          />
        </ListRefreshRegion>
      )}
      {!empty ? (
        <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
      ) : null}
    </section>
  );
}
