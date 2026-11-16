import { useEffect, useState } from "react";
import type { Ttg } from "./info-ttg.logic";
import { loadInfoTtgPage } from "./info-ttg.source";

export type InfoTtgState =
  | { status: "loading" }
  | { status: "ready"; items: Ttg[]; totalPages: number; total: number }
  | { status: "error" };

type Loaded = { key: string; state: InfoTtgState };

/** Satu halaman entri untuk kombinasi halaman/kata kunci; ganti query → kembali "loading" lalu muat ulang. */
export function useInfoTtg(page: number, limit: number, search: string): InfoTtgState {
  const key = `${page}|${limit}|${search}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadInfoTtgPage({ page, limit, search }).then(
      ({ items, totalPages, total }) => {
        if (!cancelled) setLoaded({ key, state: { status: "ready", items, totalPages, total } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat info teknologi tepat guna (halaman ${page}, kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ key, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, search]);

  return loaded?.key === key ? loaded.state : { status: "loading" };
}
