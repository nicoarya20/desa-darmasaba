'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { activeSlug, kategoriSlug, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { useListQueryNav } from '@/app/(public)/_com/kabar-list/use-list-query-nav';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { KEGIATAN_DESA_SCOPE, type KegiatanScope } from './kegiatan-scope';
import { loadKegiatanKategori, useKegiatanKategori } from './use-kegiatan-kategori';

/**
 * Kepala halaman daftar kegiatan: judul, kolom cari, lalu pil "Semua" + kategori milik admin (kategori aktif dari
 * segmen URL). Cakupan tanpa kategori (Gotong Royong) tidak memuat kategori dan tidak menampilkan pil.
 */
export function KegiatanHeader({ scope = KEGIATAN_DESA_SCOPE }: { scope?: KegiatanScope }) {
  const nav = useListQueryNav();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategori = useKegiatanKategori();
  const { text, withKategori, listHref } = scope;

  const slug = activeSlug(pathname);
  const search = searchParams.get('search')?.trim() ?? '';

  useEffect(() => {
    if (withKategori) void loadKegiatanKategori();
  }, [withKategori]);

  const tabs = withKategori
    ? [
        { slug: SEMUA_SLUG, label: text.semua },
        ...kategori.map((nama) => ({ slug: kategoriSlug(nama), label: nama })),
      ].map((tab) => ({ key: tab.slug, label: tab.label, href: listHref(tab.slug, { search }), active: tab.slug === slug }))
    : [];

  return (
    <KabarListHeader
      title={text.title}
      lead={text.lead}
      searchLabel={text.searchLabel}
      searchPlaceholder={text.searchPlaceholder}
      kategoriLabel={text.kategoriLabel}
      tabs={tabs}
      search={search}
      onSearch={(next) => nav.replaceQuery(listHref(slug, { search: next }))}
    />
  );
}
