import { useEffect, useState } from "react";

/** Keadaan muat satu halaman detail. */
export type KabarDetailState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "notfound" }
  | { status: "error" };

type Loaded<T> = { id: string; state: KabarDetailState<T> };

/**
 * Detail untuk `id` lewat `load` (`null` = tidak ditemukan, throw = galat); ganti id → kembali "loading" (data id lama
 * tidak ditampilkan). `load` harus stabil (fungsi modul); `source` dipakai di pesan log galat.
 */
export function useKabarDetail<T>(id: string, load: (id: string) => Promise<T | null>, source: string): KabarDetailState<T> {
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    load(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: "ready", data } : { status: "notfound" } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail ${source} ${id}:`, error);
        if (!cancelled) setLoaded({ id, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, load, source]);

  return loaded?.id === id ? loaded.state : { status: "loading" };
}
