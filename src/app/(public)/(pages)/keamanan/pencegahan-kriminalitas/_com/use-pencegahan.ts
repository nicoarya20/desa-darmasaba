import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import { useCallback } from "react";
import { toPencegahanItem, type PencegahanItem } from "./pencegahan.logic";
import { loadPencegahanList } from "./pencegahan.source";

/** `refreshing` = program kata kunci sebelumnya tetap tampil selama hasil kata kunci baru dimuat. */
export type PencegahanState =
  | { status: "loading" }
  | { status: "ready"; items: PencegahanItem[]; refreshing: boolean }
  | { status: "error" };

/** Program pencegahan kriminalitas untuk satu kata kunci; ganti kata kunci → muat ulang, program lama tetap tampil. */
export function usePencegahan(search: string): PencegahanState {
  const load = useCallback(() => loadPencegahanList(search).then((items) => items.map(toPencegahanItem)), [search]);
  const state = useKeepPrevious(search, load, `pencegahan kriminalitas (kata kunci "${search}")`);
  return state.status === "ready" ? { status: "ready", items: state.data, refreshing: state.refreshing } : state;
}
