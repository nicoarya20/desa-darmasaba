import stateDashboardKegiatan from "@/app/admin/(dashboard)/_state/desa/kegiatanDesa";
import { useMemo } from "react";
import { useProxy } from "valtio/utils";
import { KEGIATAN_KATEGORI_LIMIT } from "./kegiatan.meta";

/** Muat kategori kegiatan (sekali per kunjungan halaman daftar). */
export function loadKegiatanKategori(): Promise<void> {
  return stateDashboardKegiatan.kategoriKegiatan.findMany.load(1, KEGIATAN_KATEGORI_LIMIT);
}

/** Nama kategori kegiatan (urutan admin, tanpa duplikat) dari state bersama; dimuat oleh `loadKegiatanKategori`. */
export function useKegiatanKategori(): string[] {
  const data = useProxy(stateDashboardKegiatan.kategoriKegiatan.findMany).data as
    | readonly { nama?: string | null }[]
    | undefined;
  return useMemo(
    () => [...new Set((data ?? []).map((kat) => kat.nama?.trim() ?? "").filter(Boolean))],
    [data],
  );
}
