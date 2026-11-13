import { useEffect, useState } from "react";
import { toPencegahanItem, type PencegahanItem } from "./pencegahan.logic";
import { loadPencegahanList } from "./pencegahan.source";

export type PencegahanState =
  | { status: "loading" }
  | { status: "ready"; items: PencegahanItem[] }
  | { status: "error" };

type Loaded = { search: string; state: PencegahanState };

/** Program pencegahan kriminalitas untuk satu kata kunci; ganti kata kunci → muat ulang. */
export function usePencegahan(search: string): PencegahanState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPencegahanList(search).then(
      (items) => {
        if (!cancelled) setLoaded({ search, state: { status: "ready", items: items.map(toPencegahanItem) } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat pencegahan kriminalitas (kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ search, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search]);

  return loaded?.search === search ? loaded.state : { status: "loading" };
}
