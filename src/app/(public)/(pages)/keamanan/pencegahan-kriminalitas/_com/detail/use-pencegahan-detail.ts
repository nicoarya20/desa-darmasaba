import { useEffect, useState } from "react";
import type { PencegahanApiItem } from "../pencegahan.logic";
import { loadPencegahanDetail } from "../pencegahan.source";

export type PencegahanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: PencegahanApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: PencegahanDetailState };

/** Detail program untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function usePencegahanDetail(id: string): PencegahanDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPencegahanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail pencegahan kriminalitas ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
