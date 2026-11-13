'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { laporanListHref } from './laporan.logic';
import { LAPORAN_PAGE_LIMIT } from './laporan.meta';
import s from './laporan.module.css';
import { LAPORAN_TEXT as T } from './laporan.text';
import { LaporanForm } from './LaporanForm';
import { LaporanRows } from './LaporanRows';
import { useLaporanList, type LaporanListState } from './use-laporan-list';

const LIST_TITLE_ID = 'laporan-list-title';

/**
 * Halaman Laporan Publik di `.section` Kabar Desa: kepala (kembali, judul, cari `?search=`), judul bagian +
 * tombol Tambah Laporan (modal formulir), baris laporan (`?page=`), paginasi bila > 1 halaman.
 */
export function LaporanPublikPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const [reloadToken, setReloadToken] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const state = useLaporanList({ page, limit: LAPORAN_PAGE_LIMIT, search }, reloadToken);

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
        onSearch={(next) => router.replace(laporanListHref({ search: next }))}
      />
      <LaporanListBody
        state={state}
        search={search}
        page={page}
        onAdd={open}
        onPage={(next) => router.push(laporanListHref({ search, page: next }))}
      />
      <LaporanForm opened={opened} onClose={close} onSubmitted={() => setReloadToken((n) => n + 1)} />
    </div>
  );
}

type BodyProps = {
  state: LaporanListState;
  search: string;
  page: number;
  onAdd: () => void;
  onPage: (page: number) => void;
};

/** Judul bagian + tombol tambah, lalu baris laporan / pesan kosong-galat dan paginasi (diekspor untuk test). */
export function LaporanListBody({ state, search, page, onAdd, onPage }: BodyProps) {
  const empty = !state.loading && state.items.length === 0;
  const emptyText = state.failed ? T.error : search ? T.emptySearch(search) : T.empty;

  return (
    <section aria-labelledby={LIST_TITLE_ID}>
      <div className={s.toolbar}>
        <h2 id={LIST_TITLE_ID} className={s.toolbarTitle}>
          {T.listTitle}
        </h2>
        <button type="button" className={s.addButton} onClick={onAdd}>
          <IconPlus size={18} stroke={2} aria-hidden />
          {T.addButton}
        </button>
      </div>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <LaporanRows items={state.items} loading={state.loading} placeholderRows={LAPORAN_PAGE_LIMIT} />
      )}
      {!empty ? <KabarListPagination total={state.totalPages} value={page} label={T.paginationLabel} onChange={onPage} /> : null}
    </section>
  );
}
