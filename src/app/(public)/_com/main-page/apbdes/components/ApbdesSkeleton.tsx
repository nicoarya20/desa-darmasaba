import { Skeleton } from "@mantine/core";
import { APBDES_TEXT } from "../apbdes.text";
import s from "../apbdes.module.css";
import k from "./apbdes-skeleton.module.css";
import type { DetailVariant } from "./ApbdesDetail";

/** Tinggi blok keterangan tahun + tanggal pembaruan (ApbdesYearCaption): 56,9px di stg; margin-bawahnya dari `.years`. */
const CAPTION_HEIGHT = 57;
const CAPTION_WIDTH = 240;

/**
 * Placeholder bentuk konten selama data APBDes dimuat. Varian `compact` (beranda) setinggi isi akhirnya (keterangan
 * tahun + ringkasan + grafik + rincian) agar data yang datang terlambat tidak mendorong halaman (CLS); varian `full`
 * (halaman detail, rincian terbuka) tetap kerangka sederhana.
 */
export function ApbdesSkeleton({ variant = "compact" }: { variant?: DetailVariant }) {
  if (variant === "full") {
    return (
      <div className={s.content} role="status" aria-label={APBDES_TEXT.loading}>
        <div className={s.summary}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} h={232} radius={18} />
          ))}
        </div>
        <Skeleton h={360} radius={18} />
      </div>
    );
  }

  return (
    <div role="status" aria-label={APBDES_TEXT.loading}>
      <div className={s.years} aria-hidden>
        <Skeleton h={CAPTION_HEIGHT} w={CAPTION_WIDTH} radius={10} />
      </div>
      <div className={`${s.content} ${k.content}`}>
        <div className={s.summary}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} h="var(--sk-summary)" radius={18} />
          ))}
        </div>
        <Skeleton className={k.fill} radius={18} />
      </div>
    </div>
  );
}
