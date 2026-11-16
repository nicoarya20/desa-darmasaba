import { useEffect, useState } from "react";

export type LoadState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

/**
 * Muat sekali saat halaman dibuka (`load` harus fungsi modul yang stabil). Galat dilog dengan konteks `source`
 * (sebut data + halaman, mis. "mitra kolaborasi (Kolaborasi Inovasi)") lalu menjadi `error`; pemakai memutuskan
 * tampil pesan atau menyembunyikan bagian.
 */
export function useLoadOnce<T>(load: () => Promise<T>, source: string): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error: unknown) => {
        console.error(`Gagal memuat ${source}:`, error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load, source]);

  return state;
}
