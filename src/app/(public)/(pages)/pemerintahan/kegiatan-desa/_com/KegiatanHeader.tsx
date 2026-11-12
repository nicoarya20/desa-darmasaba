'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { activeSlug, kategoriSlug, SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { kegiatanListHref } from './kegiatan-list.logic';
import { KEGIATAN_TEXT } from './kegiatan.text';
import { loadKegiatanKategori, useKegiatanKategori } from './use-kegiatan-kategori';

/** Kepala halaman daftar kegiatan: pil "Semua" + kategori kegiatan milik admin; kategori aktif dari segmen URL. */
export function KegiatanHeader() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategori = useKegiatanKategori();

  const slug = activeSlug(pathname);
  const search = searchParams.get('search')?.trim() ?? '';

  useEffect(() => {
    void loadKegiatanKategori();
  }, []);

  const tabs = [
    { slug: SEMUA_SLUG, label: KEGIATAN_TEXT.semua },
    ...kategori.map((nama) => ({ slug: kategoriSlug(nama), label: nama })),
  ].map((tab) => ({ key: tab.slug, label: tab.label, href: kegiatanListHref(tab.slug, { search }), active: tab.slug === slug }));

  return (
    <KabarListHeader
      title={KEGIATAN_TEXT.title}
      lead={KEGIATAN_TEXT.lead}
      searchLabel={KEGIATAN_TEXT.searchLabel}
      searchPlaceholder={KEGIATAN_TEXT.searchPlaceholder}
      kategoriLabel={KEGIATAN_TEXT.kategoriLabel}
      tabs={tabs}
      search={search}
      onSearch={(next) => router.replace(kegiatanListHref(slug, { search: next }))}
    />
  );
}
