import { useCallback, useEffect, useState } from "react";
import type { LaporanPublik } from "../laporan.logic";
import { loadLaporanDetail } from "../laporan.source";

export type LaporanDetailState =
  | { status: "loading" }
  | { status: "ready"; data: LaporanPublik }
  | { status: "notfound" }
  | { status: "error" };

type Loaded = { key: string; state: LaporanDetailState };

/** Detail laporan untuk `id`; ganti id atau `retry()` → kembali "loading" (data lama tidak ditampilkan). */
export function useLaporanDetail(id: string): { state: LaporanDetailState; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadLaporanDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail laporan publik ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state: loaded?.key === key ? loaded.state : { status: "loading" }, retry };
}
