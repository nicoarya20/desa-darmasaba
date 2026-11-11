import korupsiState from "@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi";
import { useEffect, useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import { groupByKategori, type AntiKorupsiGroup } from "./desaantikorupsi.logic";
import { ANTIKORUPSI_LIMIT } from "./desaantikorupsi.meta";

/** Muat indikator desa anti korupsi dari `korupsiState` dan kelompokkan per kategori untuk beranda. */
export function useAntiKorupsiData(): { groups: AntiKorupsiGroup[]; loading: boolean } {
  const { data } = useSnapshot(korupsiState.desaAntikorupsi.findMany);
  // true sejak render pertama agar pesan "belum ada" tidak berkedip sebelum data pertama datang.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // load() menangani galatnya sendiri (data dikosongkan + console.error di state store).
    void korupsiState.desaAntikorupsi.findMany.load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => groupByKategori(data.slice(0, ANTIKORUPSI_LIMIT)), [data]);
  return { groups, loading };
}
