import { useEffect, useState } from "react";
import { pickTopSdgs, readSdgsList, type SdgsItem } from "./sdgs.logic";
import { SDGS_FIND_MANY_URL, SDGS_TOP_LIMIT } from "./sdgs.meta";

type SdgsState = { items: SdgsItem[]; loading: boolean; failed: boolean };

const INITIAL: SdgsState = { items: [], loading: true, failed: false };

async function loadTopSdgs(): Promise<SdgsItem[]> {
  const res = await fetch(SDGS_FIND_MANY_URL);
  if (!res.ok) throw new Error(`findMany SDGs Desa gagal (HTTP ${res.status})`);
  return pickTopSdgs(readSdgsList(await res.json()), SDGS_TOP_LIMIT);
}

/** Tujuan SDGs Desa berskor tertinggi untuk section beranda. */
export function useSdgsData(): SdgsState {
  const [state, setState] = useState<SdgsState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    loadTopSdgs().then(
      (items) => {
        if (!cancelled) setState({ items, loading: false, failed: false });
      },
      (error: unknown) => {
        console.error("Gagal memuat SDGs Desa beranda:", error);
        if (!cancelled) setState({ items: [], loading: false, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
