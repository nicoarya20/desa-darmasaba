import { useEffect, useState } from "react";
import type { KeamananLingkunganApiItem } from "../keamanan-lingkungan.logic";
import { loadKeamananLingkunganDetail } from "../keamanan-lingkungan.source";

export type KeamananLingkunganDetailState =
  | { status: "loading" }
  | { status: "ready"; data: KeamananLingkunganApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: KeamananLingkunganDetailState };

/** Detail keamanan lingkungan untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useKeamananLingkunganDetail(id: string): KeamananLingkunganDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKeamananLingkunganDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail keamanan lingkungan ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
