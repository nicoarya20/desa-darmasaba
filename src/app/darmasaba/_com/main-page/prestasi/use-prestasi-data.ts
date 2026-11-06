import { useEffect, useState } from "react";
import { loadPrestasiPage, type PrestasiPage } from "./prestasi.source";

type Result = PrestasiPage & { key: string; failed: boolean };

/** Data gabungan prestasi + penghargaan per halaman; hasil lama tetap tampil selama halaman baru dimuat. */
export function usePrestasiData({ page, pageSize, search = "" }: { page: number; pageSize: number; search?: string }) {
  const key = `${page}|${pageSize}|${search}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPrestasiPage({ page, pageSize, search }).then(
      (data) => {
        if (!cancelled) setResult({ ...data, key, failed: false });
      },
      (err: unknown) => {
        console.error(`Gagal memuat prestasi & penghargaan (halaman ${page}):`, err);
        if (!cancelled) setResult({ items: [], total: 0, key, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, pageSize, search]);

  return {
    items: result?.items ?? [],
    total: result?.total ?? 0,
    loading: result?.key !== key,
    failed: result?.key === key && result.failed,
  };
}
