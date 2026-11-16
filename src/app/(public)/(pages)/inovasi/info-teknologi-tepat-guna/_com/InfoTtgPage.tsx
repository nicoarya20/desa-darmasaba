'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { TtgCard } from './TtgCard';
import { infoTtgListHref } from './info-ttg.logic';
import { INFO_TTG_PAGE_LIMIT } from './info-ttg.meta';
import s from './info-ttg.module.css';
import { INFO_TTG_TEXT as T } from './info-ttg.text';
import { useInfoTtg, type InfoTtgState } from './use-info-ttg';

const LIST_TITLE_ID = 'info-ttg-list-title';
const PLACEHOLDER_ITEMS = 2;

/**
 * Halaman Info Teknologi Tepat Guna di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila entri > 6
 * atau sedang mencari), lalu ubin yang isinya dibaca langsung tanpa halaman detail; `?page=` dipaginasi server,
 * paginasi disembunyikan bila 1 halaman.
 */
export function InfoTtgPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useInfoTtg(page, INFO_TTG_PAGE_LIMIT, search);
  const total = state.status === 'ready' ? state.total : null;

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
        onSearch={(next) => router.replace(infoTtgListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <InfoTtgBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(infoTtgListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: InfoTtgState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Ubin entri untuk satu keadaan muat (diekspor untuk test). */
export function InfoTtgBody({ state, search, page, onPage }: BodyProps) {
  const items = state.status === 'ready' ? state.items : [];
  const empty = state.status !== 'loading' && items.length === 0;
  const emptyText = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {state.status === 'loading' ? (
        <ul className={s.list} aria-busy="true" aria-label={T.loading}>
          {Array.from({ length: PLACEHOLDER_ITEMS }, (_, i) => (
            <li key={i} className={`${s.item} ${kabar.placeholder}`} aria-hidden />
          ))}
        </ul>
      ) : null}
      {empty ? <p className={kabar.empty}>{emptyText}</p> : null}
      {items.length > 0 ? (
        <ul className={s.list}>
          {items.map((item) => (
            <TtgCard key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
      {state.status === 'ready' && items.length > 0 ? (
        <KabarListPagination total={state.totalPages} value={page} label={T.paginationLabel} onChange={onPage} />
      ) : null}
    </section>
  );
}
