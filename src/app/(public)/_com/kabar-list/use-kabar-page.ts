import { useEffect, useState } from "react";
import type { KabarItem } from "../main-page/kabar-desa/kabar.logic";

/** Query satu halaman daftar: halaman, ukuran, kata kunci, nama/slug kategori ('' = semua). */
export type KabarPageQuery = { page: number; limit: number; search: string; kategori: string };

export type KabarPage = { items: KabarItem[]; totalPages: number };

type Loaded = { key: string; items: KabarItem[]; totalPages: number; failed: boolean };

export type KabarPageState = {
  items: KabarItem[];
  totalPages: number;
  loading: boolean;
  failed: boolean;
};

/**
 * Satu halaman daftar untuk kombinasi halaman/kategori/kata kunci; ganti query → muat ulang.
 * `load` harus stabil (fungsi modul), `source` dipakai di pesan log galat.
 */
export function useKabarPage(
  load: (query: KabarPageQuery) => Promise<KabarPage>,
  query: KabarPageQuery,
  source: string,
): KabarPageState {
  const { page, limit, search, kategori } = query;
  const key = `${page}|${limit}|${kategori}|${search}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    load({ page, limit, search, kategori }).then(
      ({ items, totalPages }) => {
        if (!cancelled) setLoaded({ key, items, totalPages, failed: false });
      },
      (error: unknown) => {
        console.error(`Gagal memuat daftar ${source} (halaman ${page}, kategori "${kategori || "semua"}"):`, error);
        if (!cancelled) setLoaded({ key, items: [], totalPages: 1, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load, source, key, page, limit, search, kategori]);

  // Hasil query sebelumnya dianggap usang → tampil kerangka; jumlah halaman lama dipertahankan agar paginasi tak melompat.
  const loading = loaded?.key !== key;
  return {
    items: loading ? [] : loaded.items,
    totalPages: loaded?.totalPages ?? 1,
    loading,
    failed: !loading && loaded.failed,
  };
}
