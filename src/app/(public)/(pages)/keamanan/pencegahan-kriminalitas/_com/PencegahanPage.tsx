'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { listSearchable, parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { ListRefreshRegion } from '@/app/(public)/_com/kabar-list/ListRefreshRegion';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useSearchParams } from 'next/navigation';
import { PencegahanCards, PencegahanPlaceholder } from './PencegahanCards';
import { PencegahanSorotan } from './PencegahanSorotan';
import { arrangePencegahan, pencegahanListHref } from './pencegahan.logic';
import { PENCEGAHAN_PAGE_SIZE } from './pencegahan.meta';
import s from './pencegahan.module.css';
import { PENCEGAHAN_TEXT as T } from './pencegahan.text';
import { TIPS_FETCH_LIMIT } from './tips/tips-keamanan.meta';
import { TipsSection } from './tips/TipsSection';
import { useScrollToTips } from './tips/use-scroll-to-tips';
import { useTipsKeamanan, type TipsKeamananState } from './tips/use-tips-keamanan';
import { usePencegahan, type PencegahanState } from './use-pencegahan';

const LIST_TITLE_ID = 'pencegahan-list-title';

/**
 * Halaman Pencegahan Kriminalitas di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=` bila program + tips
 * > 6 atau sedang mencari), sorotan video (program terbaru, hanya halaman 1 tanpa kata kunci), kartu program lainnya
 * (`?page=`, dipaginasi di klien), lalu bagian Tips keamanan (`#tips-keamanan`; menu Tips Keamanan dilebur ke sini).
 */
export function PencegahanPage() {
  const nav = useListQueryNav();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = usePencegahan(search);
  const tips = useTipsKeamanan(1, TIPS_FETCH_LIMIT, search);
  const total = state.status === 'ready' && tips.status === 'ready' ? state.items.length + tips.total : null;
  useScrollToTips(state.status !== 'loading' && tips.status !== 'loading');

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
        onSearch={(next) => nav.replaceSearch(pencegahanListHref({ search: next }))}
        searchable={listSearchable(search, total)}
      />
      <PencegahanContent
        state={state}
        tips={tips}
        search={search}
        page={page}
        onPage={(next) => nav.pushPage(pencegahanListHref({ search, page: next }), LIST_TITLE_ID)}
      />
    </div>
  );
}

/**
 * Program + tips untuk satu keadaan muat (diekspor untuk test). Saat mencari: tidak cocok di keduanya → satu pesan;
 * program tidak cocok tetapi tips cocok → bagian program disembunyikan (bukan kotak "tidak ada program"). Selama
 * hasil kata kunci baru dimuat, isi lama tetap tampil di wadah `aria-busy`.
 */
export function PencegahanContent({ tips, ...program }: BodyProps & { tips: TipsKeamananState }) {
  const { state, search } = program;
  const programKosong = state.status === 'ready' && state.items.length === 0;
  const tipsKosong = tips.status === 'ready' && tips.tips.length === 0;
  const refreshing = (state.status === 'ready' && state.refreshing) || (tips.status === 'ready' && tips.refreshing);

  return (
    <ListRefreshRegion refreshing={refreshing}>
      {search && programKosong && tipsKosong ? (
        <p className={kabar.empty}>{T.emptySearchAll(search)}</p>
      ) : (
        <div className={s.stack}>
          {search && programKosong && !tipsKosong ? null : <PencegahanBody {...program} />}
          <TipsSection state={tips} />
        </div>
      )}
    </ListRefreshRegion>
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
