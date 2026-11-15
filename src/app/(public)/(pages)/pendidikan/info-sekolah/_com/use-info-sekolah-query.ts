'use client';
import { parsePage } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildListHref, type InfoSekolahQuery } from "./info-sekolah.logic";

/**
 * Jenjang, kata kunci, dan halaman daftar pengajar sebagai satu-satunya sumber kebenaran di URL
 * (`?jenjang=&search=&page=`). Kata kunci baru → halaman 1 (`replace`); pindah halaman → `push` (bisa kembali).
 * Jenjang diganti lewat tautan pil (`jenjangTabs`).
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

  return {
    query,
    setSearch: (next: string) => router.replace(buildListHref(pathname, { jenjang, search: next }), { scroll: false }),
    setPage: (next: number) => router.push(buildListHref(pathname, { jenjang, search, page: next })),
  };
}
