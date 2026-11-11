import type { PengumumanDetail } from "@/lib/pengumuman-lampiran";
import { useEffect, useState } from "react";
import { loadPengumumanDetail } from "./pengumuman-detail.source";

export type PengumumanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: PengumumanDetail }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: PengumumanDetailState };

/** Detail pengumuman untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function usePengumumanDetail(id: string): PengumumanDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPengumumanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail pengumuman ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
