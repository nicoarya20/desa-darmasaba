import { useEffect, useState } from "react";
import type { KesejahteraanApiItem } from "../kesejahteraan.logic";
import { loadKesejahteraanDetail } from "../kesejahteraan.source";

export type KesejahteraanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: KesejahteraanApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: KesejahteraanDetailState };

/** Detail program untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useKesejahteraanDetail(id: string): KesejahteraanDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKesejahteraanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail kesejahteraan masyarakat ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
