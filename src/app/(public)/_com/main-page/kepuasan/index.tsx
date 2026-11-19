"use client";

import { useDisclosure } from "@mantine/hooks";
import { FETCH_ROOT_MARGIN, useNearViewport } from "../../lazy-load/use-near-viewport";
import { CtaButton } from "./components/CtaButton";
import { LazyKepuasanCharts } from "./components/KepuasanCharts.lazy";
import { KepuasanEmpty } from "./components/KepuasanEmpty";
import { KepuasanSkeleton } from "./components/KepuasanSkeleton";
import { RespondenFormModal } from "./components/RespondenFormModal";
import s from "./kepuasan.module.css";
import { KEPUASAN_TEXT } from "./kepuasan.text";
import { useKepuasanData } from "./use-kepuasan-data";

/** Section beranda: hasil survei kepuasan (grafik bulanan + komposisi) dan form "Ajukan Responden". */
function Kepuasan() {
  // Fetch ditunda sampai section mendekati layar agar tidak berebut jaringan dengan foto hero (LCP).
  const [sectionRef, near] = useNearViewport<HTMLElement>(FETCH_ROOT_MARGIN);
  const { data, total, summary } = useKepuasanData(near);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <section ref={sectionRef} className={s.section} aria-labelledby="kepuasan-title">
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="kepuasan-title" className={s.title}>
            {KEPUASAN_TEXT.title}
          </h2>
          <p className={s.lead}>{KEPUASAN_TEXT.lead}</p>
        </header>

        {data === null ? (
          <KepuasanSkeleton />
        ) : data.length === 0 ? (
          <KepuasanEmpty onCta={open} />
        ) : (
          <>
            <LazyKepuasanCharts summary={summary} total={total} />
            <div className={s.cta}>
              <CtaButton onClick={open} />
            </div>
          </>
        )}
      </div>

      {/* Modal memuat 3 daftar opsi saat dipasang; ditunda bersama data section. Tombol pembukanya baru ada di dalam
          section ini, jadi modal selalu terpasang sebelum bisa dibuka (opsi tetap siap saat dibuka seperti dulu). */}
      {near ? <RespondenFormModal opened={opened} onClose={close} /> : null}
    </section>
  );
}

export default Kepuasan;
