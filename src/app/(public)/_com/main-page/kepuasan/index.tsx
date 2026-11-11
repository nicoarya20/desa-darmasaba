"use client";

import { useDisclosure } from "@mantine/hooks";
import { CtaButton } from "./components/CtaButton";
import { KepuasanCharts } from "./components/KepuasanCharts";
import { KepuasanEmpty } from "./components/KepuasanEmpty";
import { KepuasanSkeleton } from "./components/KepuasanSkeleton";
import { RespondenFormModal } from "./components/RespondenFormModal";
import { KEPUASAN_BRAND_VARS } from "./kepuasan.meta";
import s from "./kepuasan.module.css";
import { KEPUASAN_TEXT } from "./kepuasan.text";
import { useKepuasanData } from "./use-kepuasan-data";

/** Section beranda: hasil survei kepuasan (grafik bulanan + komposisi) dan form "Ajukan Responden". */
function Kepuasan() {
  const { data, total, summary } = useKepuasanData();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <section className={s.section} style={KEPUASAN_BRAND_VARS} aria-labelledby="kepuasan-title">
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
            <KepuasanCharts summary={summary} total={total} />
            <div className={s.cta}>
              <CtaButton onClick={open} />
            </div>
          </>
        )}
      </div>

      <RespondenFormModal opened={opened} onClose={close} />
    </section>
  );
}

export default Kepuasan;
