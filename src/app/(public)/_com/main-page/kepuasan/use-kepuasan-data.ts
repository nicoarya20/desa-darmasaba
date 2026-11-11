import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan";
import { useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { summarizeKepuasan, type RespondenItem } from "./kepuasan.logic";
import { RESPONDEN_CHART_LIMIT } from "./kepuasan.meta";

/** Data responden untuk section beranda: daftar (null = memuat), total server, dan ringkasan grafik. */
export function useKepuasanData() {
  const snap = useSnapshot(indeksKepuasanState.responden.findMany);

  useEffect(() => {
    // Muat sekali saat mount bila belum ada data. load() menangani error sendiri (data → []).
    const findMany = indeksKepuasanState.responden.findMany;
    if (!findMany.data && !findMany.loading) void findMany.load(1, RESPONDEN_CHART_LIMIT);
  }, []);

  const data = snap.data as readonly RespondenItem[] | null;
  const summary = useMemo(() => summarizeKepuasan(data), [data]);

  return { data, total: snap.total, summary };
}
