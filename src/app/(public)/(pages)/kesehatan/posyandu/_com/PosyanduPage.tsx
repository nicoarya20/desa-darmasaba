'use client';
import { useLazyLoad } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BalitaPanel } from "./BalitaPanel";
import { IbuHamilPanel } from "./IbuHamilPanel";
import { parseTab, posyanduTabHref } from "./posyandu.logic";
import { POSYANDU_TABS_TAMPIL, RINGKASAN_STATISTIK_TAMPIL, type PosyanduTab } from "./posyandu.meta";
import s from "./posyandu.module.css";
import { loadPosyanduList, loadProfilPosyandu, loadStats } from "./posyandu.source";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { PosyanduDirectory } from "./PosyanduDirectory";
import { PosyanduTabs } from "./PosyanduTabs";
import { ProfilPosyanduPanel } from "./ProfilPosyandu";
import { RingkasanPanel } from "./RingkasanPanel";
import { loadBanjarStats } from "./use-posyandu-data";

const TITLE_ID = "posyandu-page-title";
const loadDesaStats = () => loadStats();

/**
 * Halaman publik Posyandu: Ringkasan (deskripsi umum, kartu klaster, ubin APBDes), Data Posyandu (direktori baris), Balita & Ibu Hamil
 * (angka gabungan per banjar, tanpa nama). Tab di `?tab=`; data tiap tab dimuat saat tab pertama dibuka.
 * Tab/kartu statistik bisa disembunyikan lewat `POSYANDU_TABS_TERSEMBUNYI` & `RINGKASAN_STATISTIK_TAMPIL` (posyandu.meta.ts).
 */
export function PosyanduPage() {
  const router = useRouter();
  const tab = parseTab(useSearchParams().get("tab"));
  const [visited, setVisited] = useState<ReadonlySet<PosyanduTab>>(() => new Set([tab]));
  // Tab bisa berubah dari luar (tombol kembali peramban): catat sebagai sudah dibuka saat render.
  if (!visited.has(tab)) setVisited(new Set(visited).add(tab));

  // Statistik gabungan hanya dimuat bila ada bagian yang menampilkannya (kartu Ringkasan / tab Balita / Ibu Hamil).
  const butuhStatistik = RINGKASAN_STATISTIK_TAMPIL || POSYANDU_TABS_TAMPIL.some((t) => t === "balita" || t === "ibu-hamil");
  const desa = useLazyLoad(loadDesaStats, butuhStatistik, "statistik kesehatan desa");
  const profil = useLazyLoad(loadProfilPosyandu, visited.has("ringkasan"), "profil posyandu");
  const list = useLazyLoad(loadPosyanduList, visited.has("posyandu"), "daftar posyandu");
  const banjar = useLazyLoad(loadBanjarStats, visited.has("balita") || visited.has("ibu-hamil"), "statistik per banjar");

  const onTabChange = (next: PosyanduTab) => router.replace(posyanduTabHref(next), { scroll: false });

  return (
    <section className={`${apb.section} ${apb.page}`} aria-labelledby={TITLE_ID}>
      <div className={apb.inner}>
        <div className={apb.back}>
          <BackButton />
        </div>
        <header className={apb.header}>
          <h1 id={TITLE_ID} className={apb.title}>
            {T.pageTitle}
          </h1>
          <p className={apb.lead}>{T.pageLead}</p>
        </header>
        <PosyanduTabs value={tab} onChange={onTabChange} />
        <div className={s.body} key={tab}>
          {tab === "ringkasan" ? (
            <>
              <ProfilPosyanduPanel state={profil.state} onRetry={profil.retry} />
              {RINGKASAN_STATISTIK_TAMPIL ? <RingkasanPanel state={desa.state} onRetry={desa.retry} /> : null}
            </>
          ) : null}
          {tab === "posyandu" ? <PosyanduDirectory state={list.state} onRetry={list.retry} /> : null}
          {tab === "balita" ? <BalitaPanel desa={desa.state} banjar={banjar.state} onRetry={banjar.retry} /> : null}
          {tab === "ibu-hamil" ? <IbuHamilPanel desa={desa.state} banjar={banjar.state} onRetry={banjar.retry} /> : null}
        </div>
      </div>
    </section>
  );
}
