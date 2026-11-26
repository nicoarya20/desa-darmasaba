import { useKeepPrevious } from "@/app/(public)/_com/kabar-list/use-keep-previous";
import { useCallback } from "react";
import { toProgramKreatifItem, type ProgramKreatifItem } from "./program-kreatif.logic";
import { loadProgramKreatifList } from "./program-kreatif.source";

/** `refreshing` = program kata kunci sebelumnya tetap tampil selama hasil kata kunci baru dimuat. */
export type ProgramKreatifState =
  | { status: "loading" }
  | { status: "ready"; items: ProgramKreatifItem[]; refreshing: boolean }
  | { status: "error" };

/** Program kreatif untuk satu kata kunci; ganti kata kunci → muat ulang, program lama tetap tampil. */
export function useProgramKreatif(search: string): ProgramKreatifState {
  const load = useCallback(() => loadProgramKreatifList(search).then((items) => items.map(toProgramKreatifItem)), [search]);
  const state = useKeepPrevious(search, load, `program kreatif (kata kunci "${search}")`);
  return state.status === "ready" ? { status: "ready", items: state.data, refreshing: state.refreshing } : state;
}
