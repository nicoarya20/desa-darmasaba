import { useEffect, useState } from "react";
import { toProgramKreatifItem, type ProgramKreatifItem } from "./program-kreatif.logic";
import { loadProgramKreatifList } from "./program-kreatif.source";

export type ProgramKreatifState =
  | { status: "loading" }
  | { status: "ready"; items: ProgramKreatifItem[] }
  | { status: "error" };

type Loaded = { search: string; state: ProgramKreatifState };

/** Program kreatif untuk satu kata kunci; ganti kata kunci → muat ulang. */
export function useProgramKreatif(search: string): ProgramKreatifState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgramKreatifList(search).then(
      (items) => {
        if (!cancelled) setLoaded({ search, state: { status: "ready", items: items.map(toProgramKreatifItem) } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat program kreatif (kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ search, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search]);

  return loaded?.search === search ? loaded.state : { status: "loading" };
}
