'use client';
import { KabarListHeader } from '@/app/darmasaba/_com/kabar-list/KabarListHeader';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { activeKategori, kategoriTerlihat, pengumumanListHref, samaKategori } from './pengumuman-list.logic';
import { PENGUMUMAN_TEXT } from './pengumuman.text';
import { loadPengumumanKategori, usePengumumanKategori } from './use-pengumuman-kategori';

/** Kepala halaman daftar pengumuman: pil "Semua" + kategori yang berisi; kategori aktif dari segmen URL. */
export function PengumumanHeader() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriList = usePengumumanKategori();

  const active = activeKategori(pathname);
  const search = searchParams.get('search')?.trim() ?? '';

  useEffect(() => {
    void loadPengumumanKategori();
  }, []);

  const tabs = [
    { key: '', label: PENGUMUMAN_TEXT.semua, href: pengumumanListHref('', { search }), active: active === '' },
    ...kategoriTerlihat(kategoriList, active).map((kat) => ({
      key: kat.name,
      label: kat.name,
      href: pengumumanListHref(kat.name, { search }),
      active: active !== '' && samaKategori(kat.name, active),
    })),
  ];

  return (
    <KabarListHeader
      title={PENGUMUMAN_TEXT.title}
      lead={PENGUMUMAN_TEXT.lead}
      searchLabel={PENGUMUMAN_TEXT.searchLabel}
      searchPlaceholder={PENGUMUMAN_TEXT.searchPlaceholder}
      kategoriLabel={PENGUMUMAN_TEXT.kategoriLabel}
      tabs={tabs}
      search={search}
      onSearch={(next) => router.replace(pengumumanListHref(active, { search: next }))}
    />
  );
}
