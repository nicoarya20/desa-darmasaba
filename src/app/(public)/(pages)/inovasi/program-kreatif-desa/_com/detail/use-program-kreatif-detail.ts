import { useEffect, useState } from "react";
import type { ProgramKreatifApiItem } from "../program-kreatif.logic";
import { loadProgramKreatifDetail } from "../program-kreatif.source";

export type ProgramKreatifDetailState =
  | { status: "loading" }
  | { status: "ready"; data: ProgramKreatifApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: ProgramKreatifDetailState };

/** Detail program kreatif untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useProgramKreatifDetail(id: string): ProgramKreatifDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgramKreatifDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail program kreatif ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
