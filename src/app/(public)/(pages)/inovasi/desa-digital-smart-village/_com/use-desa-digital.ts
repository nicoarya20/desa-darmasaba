import { useEffect, useState } from "react";
import { toDesaDigitalItem, type DesaDigitalItem } from "./desa-digital.logic";
import { loadDesaDigitalList } from "./desa-digital.source";

export type DesaDigitalState =
  | { status: "loading" }
  | { status: "ready"; items: DesaDigitalItem[] }
  | { status: "error" };

type Loaded = { search: string; state: DesaDigitalState };

/** Layanan desa digital untuk satu kata kunci; ganti kata kunci → muat ulang. */
export function useDesaDigital(search: string): DesaDigitalState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDesaDigitalList(search).then(
      (items) => {
        if (!cancelled) setLoaded({ search, state: { status: "ready", items: items.map(toDesaDigitalItem) } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat desa digital (kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ search, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search]);

  return loaded?.search === search ? loaded.state : { status: "loading" };
}
