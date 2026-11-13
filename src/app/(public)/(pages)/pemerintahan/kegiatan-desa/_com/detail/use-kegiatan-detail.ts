import { useEffect, useState } from "react";
import { loadKegiatanDetail, type KegiatanDetail } from "./kegiatan-detail.source";

export type KegiatanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: KegiatanDetail }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: KegiatanDetailState };

/** Detail kegiatan untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useKegiatanDetail(id: string): KegiatanDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKegiatanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail kegiatan ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
