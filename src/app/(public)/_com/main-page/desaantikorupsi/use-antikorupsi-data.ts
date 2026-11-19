import korupsiState from "@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi";
import { useEffect, useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import { groupByKategori, type AntiKorupsiGroup } from "./desaantikorupsi.logic";
import { ANTIKORUPSI_LIMIT } from "./desaantikorupsi.meta";

/**
 * Muat indikator desa anti korupsi dari `korupsiState` dan kelompokkan per kategori untuk beranda. Fetch dimulai saat
 * `enabled` menyala (section mendekati layar); sampai muat pertama selesai `loading` tetap true.
 */
export function useAntiKorupsiData(enabled: boolean): { groups: AntiKorupsiGroup[]; loading: boolean } {
  const { data } = useSnapshot(korupsiState.desaAntikorupsi.findMany);
  // true sejak render pertama agar pesan "belum ada" tidak berkedip sebelum data pertama datang.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    // load() menangani galatnya sendiri (data dikosongkan + console.error di state store).
    void korupsiState.desaAntikorupsi.findMany.load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  const groups = useMemo(() => groupByKategori(data.slice(0, ANTIKORUPSI_LIMIT)), [data]);
  return { groups, loading };
}
