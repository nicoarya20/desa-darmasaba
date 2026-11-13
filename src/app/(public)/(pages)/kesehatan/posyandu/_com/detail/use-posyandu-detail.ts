import { useEffect, useState } from "react";
import { loadPosyandu, type PosyanduItem } from "../posyandu.source";

export type PosyanduDetailState =
  | { status: "loading" }
  | { status: "ready"; data: PosyanduItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: PosyanduDetailState };

/** Detail posyandu untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function usePosyanduDetail(id: string): PosyanduDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPosyandu(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail posyandu ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
