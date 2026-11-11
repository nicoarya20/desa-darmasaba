import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import { useEffect, useMemo, useState } from 'react';
import { useSnapshot } from 'valtio';
import { buildAntiKorupsiUtamaView, type AntiKorupsiUtamaView } from '../_lib/antikorupsi-utama.logic';

/** Semua indikator dimuat sekaligus (data desa ±18 butir), sama dengan halaman detail. */
const UTAMA_LIST_LIMIT = 100;

/** Muat semua indikator desa anti korupsi dari `korupsiState` dan olah untuk halaman utama. */
export function useAntiKorupsiUtamaData(): { view: AntiKorupsiUtamaView; loading: boolean } {
  const { data } = useSnapshot(korupsiState.desaAntikorupsi.findMany);
  // true sejak render pertama: store bisa berisi 10 butir sisa beranda sebelum muatan penuh selesai.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // load() menangani galatnya sendiri (data dikosongkan + console.error di state store).
    void korupsiState.desaAntikorupsi.findMany.load(1, UTAMA_LIST_LIMIT).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const view = useMemo(() => buildAntiKorupsiUtamaView(data), [data]);
  return { view, loading };
}
