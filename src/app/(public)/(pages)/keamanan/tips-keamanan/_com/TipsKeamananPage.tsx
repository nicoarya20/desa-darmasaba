'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { TipCard } from './TipCard';
import { tipsKeamananListHref, tipsSearchable } from './tips-keamanan.logic';
import { TIPS_KEAMANAN_PAGE_LIMIT, TIPS_KEAMANAN_SEARCH_THRESHOLD } from './tips-keamanan.meta';
import s from './tips-keamanan.module.css';
import { TIPS_KEAMANAN_TEXT as T } from './tips-keamanan.text';
import { useTipsKeamanan, type TipsKeamananState } from './use-tips-keamanan';

const LIST_TITLE_ID = 'tips-keamanan-list-title';
const PLACEHOLDER_TIPS = 2;

/**
 * Halaman Tips Keamanan di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila tips > 6 atau sedang mencari), lalu ubin tips yang isinya
 * (butir HTML) dibaca langsung tanpa halaman detail; `?page=` dipaginasi server, paginasi disembunyikan bila 1 halaman.
 */
export function TipsKeamananPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useTipsKeamanan(page, TIPS_KEAMANAN_PAGE_LIMIT, search);
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
        onSearch={(next) => router.replace(tipsKeamananListHref({ search: next }))}
        searchable={tipsSearchable(search, total, TIPS_KEAMANAN_SEARCH_THRESHOLD)}
      />
      <TipsKeamananBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(tipsKeamananListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: TipsKeamananState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Ubin tips untuk satu keadaan muat (diekspor untuk test). */
export function TipsKeamananBody({ state, search, page, onPage }: BodyProps) {
  const tips = state.status === 'ready' ? state.tips : [];
  const empty = state.status !== 'loading' && tips.length === 0;
  const emptyText = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {state.status === 'loading' ? (
        <ul className={s.tips} aria-busy="true" aria-label={T.loading}>
          {Array.from({ length: PLACEHOLDER_TIPS }, (_, i) => (
            <li key={i} className={`${s.tip} ${kabar.placeholder}`} aria-hidden />
          ))}
        </ul>
      ) : null}
      {empty ? <p className={kabar.empty}>{emptyText}</p> : null}
      {tips.length > 0 ? (
        <ul className={s.tips}>
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </ul>
      ) : null}
      {state.status === 'ready' && tips.length > 0 ? (
        <KabarListPagination total={state.totalPages} value={page} label={T.paginationLabel} onChange={onPage} />
      ) : null}
    </section>
  );
}
