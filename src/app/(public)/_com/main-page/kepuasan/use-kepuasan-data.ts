import { useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { summarizeKepuasan, type RespondenItem } from "./kepuasan.logic";
import { kepuasanPublik, muatKepuasanPublik } from "./kepuasan.source";

/** Data responden untuk section beranda: daftar (null = memuat), total server, dan ringkasan grafik. */
export function useKepuasanData() {
  const snap = useSnapshot(kepuasanPublik);

  useEffect(() => {
    // Muat sekali saat mount bila belum ada data. muatKepuasanPublik() menangani error sendiri (data → []).
    if (!kepuasanPublik.data && !kepuasanPublik.loading) void muatKepuasanPublik();
  }, []);

  const data = snap.data as readonly RespondenItem[] | null;
  const summary = useMemo(() => summarizeKepuasan(data), [data]);

  return { data, total: snap.total, summary };
}
