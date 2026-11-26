import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import type { ProgramTileItem } from "@/app/(public)/_com/program-tiles/ProgramTiles";
import { useCallback } from "react";
import { toProgramInovasiTile } from "./program-inovasi.logic";
import { loadProgramInovasiList } from "./program-inovasi.source";

/** `refreshing` = program kata kunci sebelumnya tetap tampil selama hasil kata kunci baru dimuat. */
export type ProgramInovasiState =
  | { status: "loading" }
  | { status: "ready"; items: ProgramTileItem[]; refreshing: boolean }
  | { status: "error" };

/** Program inovasi untuk satu kata kunci; ganti kata kunci → muat ulang, program lama tetap tampil. */
export function useProgramInovasi(search: string): ProgramInovasiState {
  const load = useCallback(() => loadProgramInovasiList(search).then((items) => items.map(toProgramInovasiTile)), [search]);
  const state = useKeepPrevious(search, load, `program inovasi (kata kunci "${search}")`);
  return state.status === "ready" ? { status: "ready", items: state.data, refreshing: state.refreshing } : state;
}
