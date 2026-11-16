import { useEffect, useState } from "react";
import type { PenghijauanApiItem } from "../penghijauan.logic";
import { loadPenghijauanDetail } from "../penghijauan.source";

export type PenghijauanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: PenghijauanApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: PenghijauanDetailState };

/** Detail program penghijauan untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function usePenghijauanDetail(id: string): PenghijauanDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPenghijauanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail program penghijauan ${id} (Program Penghijauan):`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
