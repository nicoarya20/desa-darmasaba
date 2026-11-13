'use client';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { activeSlug, kategoriLabel, parsePage, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import s from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useKabarPage } from '@/app/(public)/_com/kabar-list/use-kabar-page';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { kegiatanListHref } from './kegiatan-list.logic';
import { loadKegiatanPage } from './kegiatan-list.source';
import { KEGIATAN_PAGE_LIMIT } from './kegiatan.meta';
import { KEGIATAN_TEXT } from './kegiatan.text';
import { useKegiatanKategori } from './use-kegiatan-kategori';

const TITLE_ID = 'kegiatan-list-title';

/** Daftar kegiatan satu halaman (kategori dari URL, `?search`, `?page`): kartu utama + kartu kecil gaya Berita, lalu paginasi. */
export function KegiatanList() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const names = useKegiatanKategori();

  const slug = activeSlug(pathname);
  const kategori = slug === SEMUA_SLUG ? '' : slug;
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const { items, totalPages, loading, failed } = useKabarPage(
    loadKegiatanPage,
    { page, limit: KEGIATAN_PAGE_LIMIT, search, kategori },
    'kegiatan desa',
  );

  const empty = !loading && items.length === 0;
  const emptyText = failed
    ? KEGIATAN_TEXT.error
    : search
      ? KEGIATAN_TEXT.emptySearch(search)
      : kategori
        ? KEGIATAN_TEXT.emptyKategori(kategoriLabel(kategori, names))
        : KEGIATAN_TEXT.empty;

  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {KEGIATAN_TEXT.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita
          items={items}
          loading={loading}
          layout="grid"
          placeholderCards={KEGIATAN_PAGE_LIMIT - 1}
          listLabel={KEGIATAN_TEXT.cardsLabel}
          loadingLabel={KEGIATAN_TEXT.loading}
        />
      )}
      {!empty ? (
        <KabarListPagination
          total={totalPages}
          value={page}
          label={KEGIATAN_TEXT.paginationLabel}
          onChange={(next) => router.push(kegiatanListHref(slug, { search, page: next }))}
        />
      ) : null}
    </section>
  );
}
