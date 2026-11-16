'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, paginate, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { ProgramKreatifPlaceholder, ProgramKreatifTiles } from './ProgramKreatifTiles';
import { programKreatifListHref } from './program-kreatif.logic';
import { PROGRAM_KREATIF_PAGE_SIZE } from './program-kreatif.meta';
import { PROGRAM_KREATIF_TEXT as T } from './program-kreatif.text';
import { useProgramKreatif, type ProgramKreatifState } from './use-program-kreatif';

const LIST_TITLE_ID = 'program-kreatif-list-title';
const PLACEHOLDER_TILES = 6;

/**
 * Halaman Program Kreatif Desa di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila program > 6 atau
 * sedang mencari), lalu ubin program tanpa foto (`?page=`, dipaginasi di klien).
 */
export function ProgramKreatifPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useProgramKreatif(search);
  const total = state.status === 'ready' ? state.items.length : null;

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
        onSearch={(next) => router.replace(programKreatifListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <ProgramKreatifBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(programKreatifListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: ProgramKreatifState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Ubin + paginasi untuk satu keadaan muat (diekspor untuk test). */
export function ProgramKreatifBody({ state, search, page, onPage }: BodyProps) {
  const current = paginate(state.status === 'ready' ? state.items : [], page, PROGRAM_KREATIF_PAGE_SIZE);
  const empty = state.status !== 'loading' && current.items.length === 0;
  const emptyText = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {state.status === 'loading' ? <ProgramKreatifPlaceholder count={PLACEHOLDER_TILES} /> : null}
      {empty ? <p className={kabar.empty}>{emptyText}</p> : null}
      {current.items.length > 0 ? (
        <>
          <ProgramKreatifTiles items={current.items} />
          <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
        </>
      ) : null}
    </section>
  );
}
