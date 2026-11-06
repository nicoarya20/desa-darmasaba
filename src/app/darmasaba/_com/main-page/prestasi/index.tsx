"use client";
import prestasiState from "@/app/admin/(dashboard)/_state/landing-page/prestasi-desa";
import { useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { PrestasiGrid } from "./PrestasiGrid";
import { PrestasiHero } from "./PrestasiHero";
import { toPrestasiCards, type PrestasiApiItem } from "./prestasi.logic";
import { PRESTASI_BERANDA_LIMIT, PRESTASI_BRAND_VARS } from "./prestasi.meta";
import s from "./prestasi.module.css";

const TITLE_ID = "prestasi-title";

/** Section beranda Prestasi Desa: hero foto full-bleed + grid 4 prestasi terbaru (gaya apple.com). */
function Prestasi() {
  const snap = useSnapshot(prestasiState.prestasiDesa.findMany);

  useEffect(() => {
    // Backend mengurutkan createdAt desc → halaman 1 berisi prestasi terbaru.
    // load() menangani error sendiri (data → [] + log), jadi tidak perlu catch di sini.
    void prestasiState.prestasiDesa.findMany.load(1, PRESTASI_BERANDA_LIMIT);
  }, []);

  const cards = useMemo(
    () => toPrestasiCards(snap.data as readonly PrestasiApiItem[], PRESTASI_BERANDA_LIMIT),
    [snap.data],
  );

  return (
    <section className={s.section} style={PRESTASI_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <PrestasiHero titleId={TITLE_ID} />
      <PrestasiGrid cards={cards} loading={snap.loading} placeholderCount={PRESTASI_BERANDA_LIMIT} />
    </section>
  );
}

export default Prestasi;
