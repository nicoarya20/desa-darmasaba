'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { DesaDigitalCards, DesaDigitalPlaceholder } from './DesaDigitalCards';
import { DesaDigitalSorotan } from './DesaDigitalSorotan';
import { arrangeDesaDigital, desaDigitalListHref } from './desa-digital.logic';
import { DESA_DIGITAL_PAGE_SIZE } from './desa-digital.meta';
import s from './desa-digital.module.css';
import { DESA_DIGITAL_TEXT as T } from './desa-digital.text';
import { useDesaDigital, type DesaDigitalState } from './use-desa-digital';

const LIST_TITLE_ID = 'desa-digital-list-title';

/**
 * Halaman Desa Digital di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=`), sorotan layanan terbaru
 * (hanya halaman 1 tanpa kata kunci), lalu kartu layanan lainnya (`?page=`, dipaginasi di klien).
 */
export function DesaDigitalPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const state = useDesaDigital(search);

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
        onSearch={(next) => router.replace(desaDigitalListHref({ search: next }))}
      />
      <DesaDigitalBody
        state={state}
        search={search}
        page={page}
        onPage={(next) => router.push(desaDigitalListHref({ search, page: next }))}
      />
    </div>
  );
}

type BodyProps = {
  state: DesaDigitalState;
  search: string;
  page: number;
  onPage: (page: number) => void;
};

/** Sorotan + kartu + paginasi untuk satu keadaan muat (diekspor untuk test). */
export function DesaDigitalBody({ state, search, page, onPage }: BodyProps) {
  if (state.status === 'loading') {
    return <DesaDigitalPlaceholder sorotan={!search && page === 1} cards={DESA_DIGITAL_PAGE_SIZE} />;
  }
  if (state.status === 'error' || state.items.length === 0) {
    const text = state.status === 'error' ? T.error : search ? T.emptySearch(search) : T.empty;
    return <p className={kabar.empty}>{text}</p>;
  }

  const view = arrangeDesaDigital(state.items, { search, page, size: DESA_DIGITAL_PAGE_SIZE });
  return (
    <div className={s.stack}>
      {view.sorotan ? <DesaDigitalSorotan item={view.sorotan} /> : null}
      {view.cards.length > 0 ? (
        <section className={s.block} aria-labelledby={LIST_TITLE_ID}>
          <h2 id={LIST_TITLE_ID} className={s.blockTitle}>
            {search ? T.searchListLabel : T.listLabel}
          </h2>
          <DesaDigitalCards items={view.cards} />
          <KabarListPagination total={view.totalPages} value={view.page} label={T.paginationLabel} onChange={onPage} />
        </section>
      ) : null}
    </div>
  );
}
