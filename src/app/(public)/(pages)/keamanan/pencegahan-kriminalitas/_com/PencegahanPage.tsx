'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { PencegahanCards, PencegahanPlaceholder } from './PencegahanCards';
import { PencegahanSorotan } from './PencegahanSorotan';
import { arrangePencegahan, pencegahanListHref } from './pencegahan.logic';
import { PENCEGAHAN_PAGE_SIZE } from './pencegahan.meta';
import s from './pencegahan.module.css';
import { PENCEGAHAN_TEXT as T } from './pencegahan.text';
import { usePencegahan, type PencegahanState } from './use-pencegahan';

const LIST_TITLE_ID = 'pencegahan-list-title';

/**
 * Halaman Pencegahan Kriminalitas di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=`), sorotan video
 * (program terbaru, hanya halaman 1 tanpa kata kunci), lalu kartu program lainnya (`?page=`, dipaginasi di klien).
 */
export function PencegahanPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = usePencegahan(search);

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
        onSearch={(next) => router.replace(pencegahanListHref({ search: next }))}
      />
      <PencegahanBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(pencegahanListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: PencegahanState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Sorotan + kartu + paginasi untuk satu keadaan muat (diekspor untuk test). */
export function PencegahanBody({ state, search, page, onPage }: BodyProps) {
  if (state.status === 'loading') {
    return <PencegahanPlaceholder sorotan={!search && page === 1} cards={PENCEGAHAN_PAGE_SIZE} />;
  }
  if (state.status === 'error' || state.items.length === 0) {
    const text = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;
    return <p className={kabar.empty}>{text}</p>;
  }

  const view = arrangePencegahan(state.items, { search, page, size: PENCEGAHAN_PAGE_SIZE });
  return (
    <div className={s.stack}>
      {view.sorotan ? <PencegahanSorotan item={view.sorotan} /> : null}
      {view.cards.length > 0 ? (
        <section className={s.block} aria-labelledby={LIST_TITLE_ID}>
          <h2 id={LIST_TITLE_ID} className={s.blockTitle}>
            {search ? T.searchListLabel : T.listLabel}
          </h2>
          <PencegahanCards items={view.cards} />
          <KabarListPagination total={view.totalPages} value={view.page} label={T.paginationLabel} onChange={onPage} />
        </section>
      ) : null}
    </div>
  );
}
