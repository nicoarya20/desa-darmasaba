import type { ProgramTileItem } from "@/app/(public)/_com/program-tiles/ProgramTiles";
import { useEffect, useState } from "react";
import { toProgramInovasiTile } from "./program-inovasi.logic";
import { loadProgramInovasiList } from "./program-inovasi.source";

export type ProgramInovasiState =
  | { status: "loading" }
  | { status: "ready"; items: ProgramTileItem[] }
  | { status: "error" };

type Loaded = { search: string; state: ProgramInovasiState };

/** Program inovasi untuk satu kata kunci; ganti kata kunci → muat ulang. */
export function useProgramInovasi(search: string): ProgramInovasiState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgramInovasiList(search).then(
      (items) => {
        if (!cancelled) setLoaded({ search, state: { status: "ready", items: items.map(toProgramInovasiTile) } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat program inovasi (kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ search, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search]);

  return loaded?.search === search ? loaded.state : { status: "loading" };
}
