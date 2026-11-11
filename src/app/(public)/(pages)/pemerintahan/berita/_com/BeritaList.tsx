'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Pagination } from '@mantine/core';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { activeSlug, beritaListHref, kategoriLabel, parsePage } from './berita-list.logic';
import { BERITA_PAGE_LIMIT, SEMUA_SLUG } from './berita.meta';
import s from './berita-page.module.css';
import { BERITA_TEXT } from './berita.text';
import { useBeritaList } from './use-berita-list';

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
  const { items, totalPages, loading, failed } = useBeritaList({ page, limit: BERITA_PAGE_LIMIT, search, kategori });

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
    <section className={s.list} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {BERITA_TEXT.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <KabarBerita items={items} loading={loading} layout="grid" placeholderCards={BERITA_PAGE_LIMIT - 1} />
      )}
      {!empty && totalPages > 1 ? (
        <nav className={s.pagination} aria-label={BERITA_TEXT.paginationLabel}>
          <Pagination
            total={totalPages}
            value={Math.min(page, totalPages)}
            onChange={(next) => router.push(beritaListHref(slug, { search, page: next }))}
            siblings={1}
            boundaries={1}
            classNames={{ control: s.pageControl, dots: s.pageDots }}
          />
        </nav>
      ) : null}
    </section>
  );
}
