"use client";

import { CtaButton } from "@/app/(public)/_com/main-page/kepuasan/components/CtaButton";
import { KepuasanCharts } from "@/app/(public)/_com/main-page/kepuasan/components/KepuasanCharts";
import { KepuasanEmpty } from "@/app/(public)/_com/main-page/kepuasan/components/KepuasanEmpty";
import { KepuasanSkeleton } from "@/app/(public)/_com/main-page/kepuasan/components/KepuasanSkeleton";
import { RespondenFormModal } from "@/app/(public)/_com/main-page/kepuasan/components/RespondenFormModal";
import { KEPUASAN_BRAND_VARS } from "@/app/(public)/_com/main-page/kepuasan/kepuasan.meta";
import { KEPUASAN_TEXT } from "@/app/(public)/_com/main-page/kepuasan/kepuasan.text";
import { useKepuasanData } from "@/app/(public)/_com/main-page/kepuasan/use-kepuasan-data";
import { useDisclosure } from "@mantine/hooks";
import { PpidPage } from "../_com/PpidPage";
import s from "./_com/ikm.module.css";
import { IKM_TEXT } from "./_com/ikm.text";

/**
 * Halaman publik PPID Indeks Kepuasan Masyarakat: grafik hasil survei + form "Ajukan Responden".
 * Data, grafik, dan form sama dengan section beranda (satu sumber: `main-page/kepuasan`).
 */
function Kepuasan() {
  const { data, total, summary } = useKepuasanData();
  const [opened, { open, close }] = useDisclosure(false);

  const cta = (
    <div className={s.ctaSlot}>
      <CtaButton onClick={open} />
    </div>
  );

  let content;
  if (data === null) {
    content = <KepuasanSkeleton />;
  } else if (data.length === 0) {
    content = <KepuasanEmpty onCta={open} />;
  } else {
    content = <KepuasanCharts summary={summary} total={total} />;
  }

  return (
    <PpidPage title={KEPUASAN_TEXT.title} lead={IKM_TEXT.lead} aside={cta} style={KEPUASAN_BRAND_VARS}>
      <div className={s.surface}>{content}</div>
      <RespondenFormModal opened={opened} onClose={close} />
    </PpidPage>
  );
}

export default Kepuasan;
