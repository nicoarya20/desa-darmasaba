import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import { useCallback } from "react";
import type { Tip } from "./tips-keamanan.logic";
import { loadTipsKeamananPage } from "./tips-keamanan.source";

/** `refreshing` = tips query sebelumnya tetap tampil selama hasil query baru dimuat. */
export type TipsKeamananState =
  | { status: "loading" }
  | { status: "ready"; tips: Tip[]; totalPages: number; total: number; refreshing: boolean }
  | { status: "error" };

/** Satu halaman tips untuk kombinasi halaman/kata kunci; ganti query → muat ulang, tips lama tetap tampil. */
export function useTipsKeamanan(page: number, limit: number, search: string): TipsKeamananState {
  const load = useCallback(() => loadTipsKeamananPage({ page, limit, search }), [page, limit, search]);
  const state = useKeepPrevious(`${page}|${limit}|${search}`, load, `tips keamanan (halaman ${page}, kata kunci "${search}")`);
  return state.status === "ready" ? { status: "ready", ...state.data, refreshing: state.refreshing } : state;
}
