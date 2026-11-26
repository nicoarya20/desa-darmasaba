import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { scrollToListTitle } from './list-page-scroll';

/** Navigasi daftar yang hanya mengubah query pada pathname yang sama. */
export type ListQueryNav = {
  /** Ganti `?search=`: riwayat diganti (tidak menumpuk per ketikan), posisi gulir tetap. */
  replaceSearch: (href: string) => void;
  /** Ganti `?page=`: riwayat ditambah (Back = halaman sebelumnya), lalu gulir ke judul daftar `listTitleId` bila terlewati. */
  pushPage: (href: string, listTitleId: string) => void;
};

/**
 * Router Next biasa untuk `?search=`/`?page=`, BUKAN `useTransitionRouter`: view transition membuat seluruh halaman
 * ikut fade tiap ganti query (halaman berkedip). Perubahan pathname (tab kategori, detail, kembali) tetap memakai
 * `useTransitionRouter`/`Link` dari next-view-transitions.
 */
export function useListQueryNav(): ListQueryNav {
  const router = useRouter();
  return useMemo(
    () => ({
      replaceSearch: (href) => router.replace(href, { scroll: false }),
      pushPage: (href, listTitleId) => {
        router.push(href, { scroll: false });
        scrollToListTitle(listTitleId);
      },
    }),
    [router],
  );
}
