import { useCallback, useEffect, useState } from "react";
import { mapWithLimit, type BanjarStatsRow } from "./posyandu.logic";
import { BANJAR_STATS_CONCURRENCY } from "./posyandu.meta";
import { loadBanjarList, loadStats } from "./posyandu.source";

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

/**
 * Angka per banjar: daftar banjar lalu statistik tiap banjar (paling banyak BANJAR_STATS_CONCURRENCY bersamaan).
 * Banjar yang gagal tetap tampil sebagai baris `stats: null`; hanya kegagalan daftar banjar yang menggagalkan semuanya.
 */
export async function loadBanjarStats(): Promise<BanjarStatsRow[]> {
  const banjar = await loadBanjarList();
  return mapWithLimit(banjar, BANJAR_STATS_CONCURRENCY, async ({ id, name }) => {
    try {
      return { id, name, stats: await loadStats(id) };
    } catch (error) {
      console.error(`Gagal memuat statistik banjar ${id}:`, error);
      return { id, name, stats: null };
    }
  });
}
