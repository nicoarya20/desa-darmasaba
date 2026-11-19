import { useEffect, useState } from "react";
import { loadPrestasiPage, type PrestasiPage } from "./prestasi.source";

type Result = PrestasiPage & { key: string; failed: boolean };

/**
 * Data gabungan prestasi + penghargaan per halaman; hasil lama tetap tampil selama halaman baru dimuat.
 * `enabled` false menunda fetch (beranda: sampai section mendekati layar) dan `loading` tetap true.
 */
export function usePrestasiData({
  page,
  pageSize,
  search = "",
  enabled = true,
}: {
  page: number;
  pageSize: number;
  search?: string;
  enabled?: boolean;
}) {
  const key = `${page}|${pageSize}|${search}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled, key, page, pageSize, search]);

  return {
    items: result?.items ?? [],
    total: result?.total ?? 0,
    loading: result?.key !== key,
    failed: result?.key === key && result.failed,
  };
}
