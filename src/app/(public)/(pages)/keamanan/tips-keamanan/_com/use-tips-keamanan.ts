import { useEffect, useState } from "react";
import type { Tip } from "./tips-keamanan.logic";
import { loadTipsKeamananPage } from "./tips-keamanan.source";

export type TipsKeamananState =
  | { status: "loading" }
  | { status: "ready"; tips: Tip[]; totalPages: number; total: number }
  | { status: "error" };

type Loaded = { key: string; state: TipsKeamananState };

/** Satu halaman tips untuk kombinasi halaman/kata kunci; ganti query → kembali "loading" lalu muat ulang. */
export function useTipsKeamanan(page: number, limit: number, search: string): TipsKeamananState {
  const key = `${page}|${limit}|${search}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTipsKeamananPage({ page, limit, search }).then(
      ({ tips, totalPages, total }) => {
        if (!cancelled) setLoaded({ key, state: { status: "ready", tips, totalPages, total } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat tips keamanan (halaman ${page}, kata kunci "${search}"):`, error);
        if (!cancelled) setLoaded({ key, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, search]);

  return loaded?.key === key ? loaded.state : { status: "loading" };
}
