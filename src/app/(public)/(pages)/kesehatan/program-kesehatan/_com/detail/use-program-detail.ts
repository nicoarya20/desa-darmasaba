import { useEffect, useState } from "react";
import type { ProgramApiItem } from "../program.logic";
import { loadProgramDetail } from "../program.source";

export type ProgramDetailState =
  | { status: "loading" }
  | { status: "ready"; data: ProgramApiItem }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { id: string; state: ProgramDetailState };

/** Detail program kesehatan untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function useProgramDetail(id: string): ProgramDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgramDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail program kesehatan ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
