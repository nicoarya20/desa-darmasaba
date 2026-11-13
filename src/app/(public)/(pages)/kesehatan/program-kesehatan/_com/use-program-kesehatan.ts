import { useEffect, useState } from "react";
import type { KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { toKegiatanList } from "./program.logic";
import { loadProgramKesehatan } from "./program.source";

export type ProgramKesehatanState =
  | { status: "loading" }
  | { status: "ready"; kegiatan: KabarItem[] }
  | { status: "error" };

type Loaded = { search: string; state: ProgramKesehatanState };

/** Kartu program kesehatan untuk satu kata kunci (indikator disaring); ganti kata kunci → muat ulang. */
export function useProgramKesehatan(search: string): ProgramKesehatanState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgramKesehatan(search).then(
      (items) => {
        if (!cancelled) setLoaded({ search, state: { status: "ready", kegiatan: toKegiatanList(items) } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat program kesehatan (kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ search, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search]);

  return loaded?.search === search ? loaded.state : { status: "loading" };
}
