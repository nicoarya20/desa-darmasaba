'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { activeSlug, kategoriLabel, parsePage, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import s from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useKabarPage } from '@/app/(public)/_com/kabar-list/use-kabar-page';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { beritaListHref } from './berita-list.logic';
import { loadBeritaPage } from './berita-list.source';
import { BERITA_PAGE_LIMIT } from './berita.meta';
import { BERITA_TEXT } from './berita.text';

const TITLE_ID = 'berita-list-title';

/** Daftar berita satu halaman (kategori dari URL, `?search`, `?page`): kartu utama + kartu kecil, lalu paginasi. */
export function BeritaList() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriState = useProxy(stateDashboardBerita.kategoriBerita);

  const slug = activeSlug(pathname);
  const kategori = slug === SEMUA_SLUG ? '' : slug;
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const { items, totalPages, loading, failed } = useKabarPage(
    loadBeritaPage,
    { page, limit: BERITA_PAGE_LIMIT, search, kategori },
    'berita',
  );

  const empty = !loading && items.length === 0;
  const names = (kategoriState.findMany.data ?? []).map((kat) => kat.name);
  const emptyText = failed
    ? BERITA_TEXT.error
    : search
      ? BERITA_TEXT.emptySearch(search)
      : kategori
        ? BERITA_TEXT.emptyKategori(kategoriLabel(kategori, names))
        : BERITA_TEXT.empty;

  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {BERITA_TEXT.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita items={items} loading={loading} layout="grid" placeholderCards={BERITA_PAGE_LIMIT - 1} />
      )}
      {!empty ? (
        <KabarListPagination
          total={totalPages}
          value={page}
          label={BERITA_TEXT.paginationLabel}
          onChange={(next) => router.push(beritaListHref(slug, { search, page: next }))}
        />
      ) : null}
    </section>
  );
}
