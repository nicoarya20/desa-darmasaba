"use client";
import { FETCH_ROOT_MARGIN, useNearViewport } from "../../lazy-load/use-near-viewport";
import { PrestasiGrid } from "./PrestasiGrid";
import { PrestasiHero } from "./PrestasiHero";
import { PRESTASI_BERANDA_LIMIT } from "./prestasi.meta";
import s from "./prestasi.module.css";
import { usePrestasiData } from "./use-prestasi-data";

const TITLE_ID = "prestasi-title";

/** Section beranda Prestasi dan Penghargaan Desa: hero video + grid 4 entri prestasi & penghargaan terbaru. */
function Prestasi() {
  // Fetch ditunda sampai section mendekati layar agar tidak berebut jaringan dengan foto hero (LCP).
  const [sectionRef, near] = useNearViewport<HTMLElement>(FETCH_ROOT_MARGIN);
  const { items, loading } = usePrestasiData({ page: 1, pageSize: PRESTASI_BERANDA_LIMIT, enabled: near });

  return (
    <section ref={sectionRef} className={s.section} aria-labelledby={TITLE_ID}>
      <PrestasiHero titleId={TITLE_ID} />
      <PrestasiGrid cards={items} loading={loading} placeholderCount={PRESTASI_BERANDA_LIMIT} />
    </section>
  );
}

export default Prestasi;
