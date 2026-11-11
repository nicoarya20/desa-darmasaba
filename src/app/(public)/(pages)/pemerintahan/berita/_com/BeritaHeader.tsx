'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import { activeSlug, beritaListHref, kategoriSlug } from './berita-list.logic';
import { SEMUA_SLUG } from './berita.meta';
import { BERITA_TEXT } from './berita.text';

/** Kepala halaman daftar berita: pil "Semua" + kategori berita; kategori aktif dari segmen URL. */
export function BeritaHeader() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriState = useProxy(stateDashboardBerita.kategoriBerita);

  const slug = activeSlug(pathname);
  const search = searchParams.get('search')?.trim() ?? '';

  useEffect(() => {
    kategoriState.findMany.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- daftar kategori cukup dimuat sekali per kunjungan
  }, []);

  const tabs = [
    { slug: SEMUA_SLUG, label: BERITA_TEXT.semua },
    ...(kategoriState.findMany.data ?? []).map((kat) => ({ slug: kategoriSlug(kat.name), label: kat.name })),
  ].map((tab) => ({ key: tab.slug, label: tab.label, href: beritaListHref(tab.slug, { search }), active: tab.slug === slug }));

  return (
    <KabarListHeader
      title={BERITA_TEXT.title}
      lead={BERITA_TEXT.lead}
      searchLabel={BERITA_TEXT.searchLabel}
      searchPlaceholder={BERITA_TEXT.searchPlaceholder}
      kategoriLabel={BERITA_TEXT.kategoriLabel}
      tabs={tabs}
      search={search}
      onSearch={(next) => router.replace(beritaListHref(slug, { search: next }))}
    />
  );
}
