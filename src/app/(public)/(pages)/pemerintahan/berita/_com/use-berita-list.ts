import { useEffect, useState } from "react";
import type { KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { loadBeritaPage, type BeritaQuery } from "./berita-list.source";

type Loaded = { key: string; items: KabarItem[]; totalPages: number; failed: boolean };

type BeritaListState = {
  items: KabarItem[];
  totalPages: number;
  loading: boolean;
  failed: boolean;
};

/** Daftar berita untuk satu kombinasi halaman/kategori/kata kunci; ganti query → muat ulang. */
export function useBeritaList(query: BeritaQuery): BeritaListState {
  const { page, limit, search, kategori } = query;
  const key = `${page}|${limit}|${kategori}|${search}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadBeritaPage({ page, limit, search, kategori }).then(
      ({ items, totalPages }) => {
        if (!cancelled) setLoaded({ key, items, totalPages, failed: false });
      },
      (error: unknown) => {
        console.error(`Gagal memuat daftar berita (halaman ${page}, kategori "${kategori || "semua"}"):`, error);
        if (!cancelled) setLoaded({ key, items: [], totalPages: 1, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, search, kategori]);

  // Hasil query sebelumnya dianggap usang → tampil kerangka; jumlah halaman lama dipertahankan agar paginasi tak melompat.
  const loading = loaded?.key !== key;
  return {
    items: loading ? [] : loaded.items,
    totalPages: loaded?.totalPages ?? 1,
    loading,
    failed: !loading && loaded.failed,
  };
}
