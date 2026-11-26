import { useCallback } from "react";
import type { KabarItem } from "../main-page/kabar-desa/kabar.logic";
import { toPagedListState, type PagedListState } from "./keep-previous.logic";
import { useKeepPrevious } from "./use-keep-previous";

/** Query satu halaman daftar: halaman, ukuran, kata kunci, nama/slug kategori ('' = semua). */
export type KabarPageQuery = { page: number; limit: number; search: string; kategori: string };

export type KabarPage = { items: KabarItem[]; totalPages: number };

export type KabarPageState = PagedListState<KabarItem>;

/**
 * Satu halaman daftar untuk kombinasi halaman/kategori/kata kunci; ganti query → muat ulang sambil mempertahankan
 * daftar lama (jumlah halaman lama ikut dipertahankan agar paginasi tak melompat). `load` harus stabil (fungsi
 * modul), `source` dipakai di pesan log galat.
 */
export function useKabarPage(
  load: (query: KabarPageQuery) => Promise<KabarPage>,
  query: KabarPageQuery,
  source: string,
): KabarPageState {
  const { page, limit, search, kategori } = query;
  const run = useCallback(() => load({ page, limit, search, kategori }), [load, page, limit, search, kategori]);
  return toPagedListState(
    useKeepPrevious(`${page}|${limit}|${kategori}|${search}`, run, `daftar ${source} (halaman ${page}, kategori "${kategori || "semua"}")`),
  );
}
