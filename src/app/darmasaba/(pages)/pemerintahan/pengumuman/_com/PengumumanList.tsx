'use client';
import { KabarListPagination } from '@/app/darmasaba/_com/kabar-list/KabarListPagination';
import { parsePage } from '@/app/darmasaba/_com/kabar-list/kabar-list.logic';
import s from '@/app/darmasaba/_com/kabar-list/kabar-list.module.css';
import { useKabarPage } from '@/app/darmasaba/_com/kabar-list/use-kabar-page';
import kabar from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { PengumumanRows } from './PengumumanRows';
import { activeKategori, labelKategori, pengumumanListHref } from './pengumuman-list.logic';
import { loadPengumumanPage } from './pengumuman-list.source';
import { PENGUMUMAN_PAGE_LIMIT } from './pengumuman.meta';
import { PENGUMUMAN_TEXT } from './pengumuman.text';
import { usePengumumanKategori } from './use-pengumuman-kategori';

const TITLE_ID = 'pengumuman-list-title';

/** Daftar pengumuman satu halaman (kategori dari URL, `?search`, `?page`): panel baris, lalu paginasi. */
export function PengumumanList() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriList = usePengumumanKategori();

  const kategori = activeKategori(pathname);
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const { items, totalPages, loading, failed } = useKabarPage(
    loadPengumumanPage,
    { page, limit: PENGUMUMAN_PAGE_LIMIT, search, kategori },
    'pengumuman',
  );

  const empty = !loading && items.length === 0;
  const emptyText = failed
    ? PENGUMUMAN_TEXT.error
    : search
      ? PENGUMUMAN_TEXT.emptySearch(search)
      : kategori
        ? PENGUMUMAN_TEXT.emptyKategori(labelKategori(kategori, kategoriList))
        : PENGUMUMAN_TEXT.empty;

  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {PENGUMUMAN_TEXT.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <PengumumanRows
          items={items}
          loading={loading}
          placeholderRows={PENGUMUMAN_PAGE_LIMIT}
          showKategori={kategori === ''}
          loadingLabel={PENGUMUMAN_TEXT.loading}
        />
      )}
      {!empty ? (
        <KabarListPagination
          total={totalPages}
          value={page}
          label={PENGUMUMAN_TEXT.paginationLabel}
          onChange={(next) => router.push(pengumumanListHref(kategori, { search, page: next }))}
        />
      ) : null}
    </section>
  );
}
