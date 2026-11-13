import { useCallback, useEffect, useState } from "react";

/** Status muat data halaman publik: belum diminta, sedang dimuat, siap, atau galat. */
export type LoadState<T> = { status: "idle" } | { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

type Loaded<T> = { attempt: number; state: LoadState<T> };

/**
 * Muat data sekali `enabled` menyala (tab pertama kali dibuka) lalu simpan selama halaman terbuka.
 * `retry` memuat ulang. Status "loading" diturunkan dari percobaan yang belum selesai (tanpa setState di efek).
 */
export function useLazyLoad<T>(load: () => Promise<T>, enabled: boolean, what: string) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setLoaded({ attempt, state: { status: "ready", data } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat ${what}:`, error);
        if (!cancelled) setLoaded({ attempt, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` & `what` konstan per pemakai; pemicu muat = enabled & attempt
  }, [enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: LoadState<T> = !enabled
    ? { status: "idle" }
    : loaded?.attempt === attempt
      ? loaded.state
      : { status: "loading" };
  return { state, retry };
}
