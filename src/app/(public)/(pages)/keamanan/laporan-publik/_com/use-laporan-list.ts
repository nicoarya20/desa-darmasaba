import { toPagedListState, type PagedListState } from "@/app/(public)/_com/kabar-list/keep-previous.logic";
import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import { useCallback } from "react";
import type { LaporanPublik } from "./laporan.logic";
import { loadLaporanPage } from "./laporan.source";

export type LaporanListState = PagedListState<LaporanPublik>;

/**
 * Satu halaman daftar laporan untuk `page`/`search`; ganti query atau naikkan `reloadToken` (setelah kirim
 * laporan) → muat ulang sambil mempertahankan baris lama dan jumlah halaman lama agar paginasi tidak melompat.
 */
export function useLaporanList(query: { page: number; limit: number; search: string }, reloadToken: number): LaporanListState {
  const { page, limit, search } = query;
  // reloadToken cukup masuk kunci: kunci berubah → efek muat ulang berjalan lagi walau `load` sama.
  const load = useCallback(() => loadLaporanPage({ page, limit, search }), [page, limit, search]);
  return toPagedListState(
    useKeepPrevious(`${page}|${limit}|${search}|${reloadToken}`, load, `daftar laporan publik (halaman ${page}, cari "${search}")`),
  );
}
