import type { KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import { useCallback } from "react";
import { toKegiatanList } from "./program.logic";
import { loadProgramKesehatan } from "./program.source";

/** `refreshing` = kartu kata kunci sebelumnya tetap tampil selama hasil kata kunci baru dimuat. */
export type ProgramKesehatanState =
  | { status: "loading" }
  | { status: "ready"; kegiatan: KabarItem[]; refreshing: boolean }
  | { status: "error" };

/** Kartu program kesehatan untuk satu kata kunci (indikator disaring); ganti kata kunci → muat ulang, kartu lama tetap tampil. */
export function useProgramKesehatan(search: string): ProgramKesehatanState {
  const load = useCallback(() => loadProgramKesehatan(search).then(toKegiatanList), [search]);
  const state = useKeepPrevious(search, load, `program kesehatan (kata kunci "${search}")`);
  return state.status === "ready" ? { status: "ready", kegiatan: state.data, refreshing: state.refreshing } : state;
}
