import { useEffect, useState } from "react";
import type { LaporanPublik } from "./laporan.logic";
import { loadLaporanPage } from "./laporan.source";

export type LaporanListState = {
  items: LaporanPublik[];
  totalPages: number;
  loading: boolean;
  failed: boolean;
};

type Loaded = { key: string; items: LaporanPublik[]; totalPages: number; failed: boolean };

/**
 * Satu halaman daftar laporan untuk `page`/`search`; ganti query atau naikkan `reloadToken` (setelah kirim
 * laporan) → muat ulang. Jumlah halaman lama dipertahankan selama memuat agar paginasi tidak melompat.
 */
export function useLaporanList(query: { page: number; limit: number; search: string }, reloadToken: number): LaporanListState {
  const { page, limit, search } = query;
  const key = `${page}|${limit}|${search}|${reloadToken}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadLaporanPage({ page, limit, search }).then(
      ({ items, totalPages }) => {
        if (!cancelled) setLoaded({ key, items, totalPages, failed: false });
      },
      (error: unknown) => {
        console.error(`Gagal memuat daftar laporan publik (halaman ${page}, cari "${search}"):`, error);
        if (!cancelled) setLoaded({ key, items: [], totalPages: 1, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, search]);

  const loading = loaded?.key !== key;
  return {
    items: loading ? [] : loaded.items,
    totalPages: loaded?.totalPages ?? 1,
    loading,
    failed: !loading && loaded.failed,
  };
}
