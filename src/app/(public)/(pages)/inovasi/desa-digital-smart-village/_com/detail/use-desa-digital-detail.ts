import { useEffect, useState } from "react";
import type { DesaDigitalApiItem } from "../desa-digital.logic";
import { loadDesaDigitalDetail } from "../desa-digital.source";

export type DesaDigitalDetailState =
  | { status: "loading" }
  | { status: "ready"; data: DesaDigitalApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: DesaDigitalDetailState };

/** Detail layanan desa digital untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useDesaDigitalDetail(id: string): DesaDigitalDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDesaDigitalDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail desa digital ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
