'use client';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parsePage } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { buildListHref, type InfoSekolahQuery } from "./info-sekolah.logic";

/**
 * Jenjang, kata kunci, dan halaman tabel Info Sekolah sebagai satu-satunya sumber kebenaran di URL
 * (`?jenjang=&search=&page=`). Mengubah jenjang/kata kunci selalu kembali ke halaman 1.
 */
export function useInfoSekolahQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query: InfoSekolahQuery = {
    jenjang: (params.get("jenjang") ?? "").trim().toLowerCase(),
    search: (params.get("search") ?? "").trim(),
    page: parsePage(params.get("page")),
  };
  const { jenjang, search } = query;

  const replace = useCallback(
    (next: Partial<InfoSekolahQuery>) => router.replace(buildListHref(pathname, { jenjang, search, ...next }), { scroll: false }),
    [router, pathname, jenjang, search],
  );

  return {
    query,
    setJenjang: (next: string) => replace({ jenjang: next, page: 1 }),
    setSearch: (next: string) => replace({ search: next, page: 1 }),
    setPage: (next: number) => replace({ page: next }),
  };
}
