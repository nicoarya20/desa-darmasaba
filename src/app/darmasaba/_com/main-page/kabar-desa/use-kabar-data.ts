import { useEffect, useState } from "react";
import { loadBeritaTerbaru, loadPengumumanTerbaru } from "./kabar.source";
import type { KabarItem } from "./kabar.logic";
import { KABAR_BERITA_LIMIT, KABAR_PENGUMUMAN_LIMIT } from "./kabar.meta";

type KabarState = {
  berita: KabarItem[];
  pengumuman: KabarItem[];
  loading: boolean;
  /** Kedua sumber gagal → tampilkan pesan galat. Satu gagal → bagian itu saja yang kosong. */
  failed: boolean;
};

const INITIAL: KabarState = { berita: [], pengumuman: [], loading: true, failed: false };

/** Berita + pengumuman terbaru untuk section Kabar Desa; tiap sumber berdiri sendiri. */
export function useKabarData(): KabarState {
  const [state, setState] = useState<KabarState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([loadBeritaTerbaru(KABAR_BERITA_LIMIT), loadPengumumanTerbaru(KABAR_PENGUMUMAN_LIMIT)]).then(
      ([berita, pengumuman]) => {
        if (berita.status === "rejected") console.error("Gagal memuat berita Kabar Desa:", berita.reason);
        if (pengumuman.status === "rejected") console.error("Gagal memuat pengumuman Kabar Desa:", pengumuman.reason);
        if (cancelled) return;
        setState({
          berita: berita.status === "fulfilled" ? berita.value : [],
          pengumuman: pengumuman.status === "fulfilled" ? pengumuman.value : [],
          loading: false,
          failed: berita.status === "rejected" && pengumuman.status === "rejected",
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
