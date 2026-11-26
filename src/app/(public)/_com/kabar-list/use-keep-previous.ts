import { useEffect, useState } from "react";
import { resolveKeepPrevious, type KeepPreviousSettled, type KeepPreviousState } from "./keep-previous.logic";

/**
 * Muat data untuk kunci query `key`; ganti kunci → muat ulang sambil mempertahankan data lama (`refreshing`), bukan
 * kembali ke kerangka. `load` wajib stabil per kunci (bungkus `useCallback` dengan dependensi yang sama dengan
 * kunci). Galat dilog dengan konteks `source` (sebut data + query, mis. `program kesehatan (kata kunci "x")`).
 */
export function useKeepPrevious<T>(key: string, load: () => Promise<T>, source: string): KeepPreviousState<T> {
  const [settled, setSettled] = useState<KeepPreviousSettled<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setSettled({ key, status: "ready", data });
      },
      (error: unknown) => {
        console.error(`Gagal memuat ${source}:`, error);
        if (!cancelled) setSettled({ key, status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, load, source]);

  return resolveKeepPrevious(settled, key);
}
