'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, paginate, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { KEGIATAN_PAGE_LIMIT } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan.meta';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { gotongRoyongListHref, searchGotongRoyong } from './gotong-royong.logic';
import { loadGotongRoyongList } from './gotong-royong.source';
import { GOTONG_ROYONG_TEXT as T } from './gotong-royong.text';

const LIST_TITLE_ID = 'gotong-royong-list-title';

/**
 * Halaman Gotong Royong di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila kegiatan > 6 atau sedang
 * mencari, tanpa pil kategori), lalu kartu kegiatan gaya Kegiatan Desa (`?page=`, dipaginasi di klien).
 */
export function GotongRoyongPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useLoadOnce(loadGotongRoyongList, 'kegiatan gotong royong (Gotong Royong)');
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
        onSearch={(next) => router.replace(gotongRoyongListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <GotongRoyongBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(gotongRoyongListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: LoadState<KabarItem[]>;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Kartu + paginasi untuk satu keadaan muat (diekspor untuk test). */
export function GotongRoyongBody({ state, search, page, onPage }: BodyProps) {
  const found = state.status === 'ready' ? searchGotongRoyong(state.data, search) : [];
  const current = paginate(found, page, KEGIATAN_PAGE_LIMIT);
  const empty = state.status !== 'loading' && current.items.length === 0;
  const emptyText = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <h2 id={LIST_TITLE_ID} className={l.srOnly}>
        {T.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita
          items={current.items}
          loading={state.status === 'loading'}
          layout="grid"
          placeholderCards={KEGIATAN_PAGE_LIMIT - 1}
          listLabel={T.cardsLabel}
          loadingLabel={T.loading}
        />
      )}
      {current.items.length > 0 ? (
        <KabarListPagination total={current.totalPages} value={current.page} label={T.paginationLabel} onChange={onPage} />
      ) : null}
    </section>
  );
}
