import { useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { summarizeKepuasan, type RespondenItem } from "./kepuasan.logic";
import { kepuasanPublik, muatKepuasanPublik } from "./kepuasan.source";

/**
 * Data responden untuk section beranda & halaman IKM: daftar (null = memuat), total server, dan ringkasan grafik.
 * `enabled` false menunda muat (beranda: sampai section mendekati layar); halaman IKM memakai bawaan true.
 */
export function useKepuasanData(enabled = true) {
  const snap = useSnapshot(kepuasanPublik);

  useEffect(() => {
    if (!enabled) return;
    // Muat sekali bila belum ada data. muatKepuasanPublik() menangani error sendiri (data → []).
    if (!kepuasanPublik.data && !kepuasanPublik.loading) void muatKepuasanPublik();
  }, [enabled]);

  const data = snap.data as readonly RespondenItem[] | null;
  const summary = useMemo(() => summarizeKepuasan(data), [data]);

  return { data, total: snap.total, summary };
}
