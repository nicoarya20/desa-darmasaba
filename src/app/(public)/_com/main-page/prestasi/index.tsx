"use client";
import { PrestasiGrid } from "./PrestasiGrid";
import { PrestasiHero } from "./PrestasiHero";
import { PRESTASI_BERANDA_LIMIT, PRESTASI_BRAND_VARS } from "./prestasi.meta";
import s from "./prestasi.module.css";
import { usePrestasiData } from "./use-prestasi-data";

const TITLE_ID = "prestasi-title";

/** Section beranda Prestasi dan Penghargaan Desa: hero video + grid 4 entri prestasi & penghargaan terbaru. */
function Prestasi() {
  const { items, loading } = usePrestasiData({ page: 1, pageSize: PRESTASI_BERANDA_LIMIT });

  return (
    <section className={s.section} style={PRESTASI_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <PrestasiHero titleId={TITLE_ID} />
      <PrestasiGrid cards={items} loading={loading} placeholderCount={PRESTASI_BERANDA_LIMIT} />
    </section>
  );
}

export default Prestasi;
