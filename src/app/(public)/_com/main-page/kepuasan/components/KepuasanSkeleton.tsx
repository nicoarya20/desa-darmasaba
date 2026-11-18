import { Skeleton } from "@mantine/core";
import lazy from "../../../lazy-chart/lazy-chart.module.css";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";
import k from "./kepuasan-skeleton.module.css";

/** Tinggi tombol "Ajukan Responden" (CtaButton): 12px padding ×2 + teks; diukur 50,3px di stg. */
const CTA_HEIGHT = 50;
const CTA_WIDTH = 200;

/**
 * Placeholder bentuk konten selama data dimuat. Tingginya sama dengan isi akhir (kotak `lazy.kepuasan` + tombol ajakan)
 * agar data yang datang terlambat tidak mendorong halaman (CLS).
 */
export function KepuasanSkeleton() {
  return (
    <>
      <div className={`${lazy.kepuasan} ${k.sizes}`} role="status" aria-label={KEPUASAN_TEXT.loading}>
        <div className={s.content}>
          <Skeleton h="var(--sk-monthly)" radius={18} />
          <div className={s.grid}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} h="var(--sk-card)" radius={18} />
            ))}
          </div>
        </div>
      </div>
      <div className={s.cta} aria-hidden>
        <Skeleton h={CTA_HEIGHT} w={CTA_WIDTH} radius={980} />
      </div>
    </>
  );
}
