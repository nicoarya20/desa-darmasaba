'use client';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { activeSlug, kategoriLabel, parsePage, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import s from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import { useKabarPage } from '@/app/(public)/_com/kabar-list/use-kabar-page';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { ListRefreshRegion } from '@/app/(public)/_com/kabar-list/ListRefreshRegion';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import { usePathname, useSearchParams } from 'next/navigation';
import { KEGIATAN_PAGE_LIMIT } from './kegiatan.meta';
import { KEGIATAN_DESA_SCOPE, type KegiatanScope } from './kegiatan-scope';
import { useKegiatanKategori } from './use-kegiatan-kategori';

const TITLE_ID = 'kegiatan-list-title';

/**
 * Daftar kegiatan satu halaman (kategori dari URL bila cakupan memakai pil, `?search`, `?page`): kartu utama +
 * kartu kecil gaya Berita, lalu paginasi.
 */
export function KegiatanList({ scope = KEGIATAN_DESA_SCOPE }: { scope?: KegiatanScope }) {
  const nav = useListQueryNav();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const names = useKegiatanKategori();
  const { text } = scope;

  const slug = activeSlug(pathname);
  const kategori = scope.withKategori && slug !== SEMUA_SLUG ? slug : '';
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const { items, totalPages, loading, refreshing, failed } = useKabarPage(
    scope.load,
    { page, limit: KEGIATAN_PAGE_LIMIT, search, kategori },
    'kegiatan desa',
  );

  const empty = !loading && items.length === 0;
  const emptyText = failed
    ? text.error
    : search
      ? text.emptySearch(search)
      : kategori
        ? text.emptyKategori(kategoriLabel(kategori, names))
        : text.empty;

  return (
    <section aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.srOnly}>
        {text.listLabel}
      </h2>
      {empty ? (
        <p className={kabar.empty}>{emptyText}</p>
      ) : (
        <ListRefreshRegion refreshing={refreshing}>
          <KabarBerita
            items={items}
            loading={loading}
            layout="grid"
            placeholderCards={KEGIATAN_PAGE_LIMIT - 1}
            listLabel={text.cardsLabel}
            loadingLabel={text.loading}
          />
        </ListRefreshRegion>
      )}
      {!empty ? (
        <KabarListPagination
          total={totalPages}
          value={page}
          label={text.paginationLabel}
          onChange={(next) => nav.pushPage(scope.listHref(slug, { search, page: next }), TITLE_ID)}
        />
      ) : null}
    </section>
  );
}
