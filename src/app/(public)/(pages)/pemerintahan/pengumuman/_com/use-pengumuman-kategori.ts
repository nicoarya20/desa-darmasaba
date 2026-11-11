import stateDesaPengumuman from "@/app/admin/(dashboard)/_state/desa/pengumuman";
import { useMemo } from "react";
import { useProxy } from "valtio/utils";
import type { PengumumanKategori } from "./pengumuman-list.logic";
import { PENGUMUMAN_KATEGORI_LIMIT } from "./pengumuman.meta";

/** Muat kategori pengumuman (sekali per kunjungan halaman daftar). */
export function loadPengumumanKategori(): Promise<void> {
  return stateDesaPengumuman.category.findMany.load(1, PENGUMUMAN_KATEGORI_LIMIT);
}

/** Kategori pengumuman (nama + jumlah) dari state bersama; dimuat oleh `loadPengumumanKategori`. */
export function usePengumumanKategori(): PengumumanKategori[] {
  const state = useProxy(stateDesaPengumuman.category.findMany);
  const data = state.data;
  return useMemo(
    () => (data ?? []).map((kat) => ({ name: kat.name, count: kat._count?.pengumumans ?? 0 })),
    [data],
  );
}
