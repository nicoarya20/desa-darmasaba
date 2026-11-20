import { Image } from "@mantine/core";
import { SkeletonText } from "../../skeleton-text/SkeletonText";
import type { SdgsItem } from "./sdgs.logic";
import { SDGS_SKELETON_NAME_CHARS, SDGS_SKELETON_SCORE_CHARS } from "./sdgs.meta";
import s from "./sdgs.module.css";
import { SDGS_TEXT } from "./sdgs.text";

/** Grid kartu skor tujuan SDGs: ikon resmi, nama tujuan, skor besar. */
export function SdgsCards({ items }: { items: readonly SdgsItem[] }) {
  return (
    <ul className={s.grid}>
      {items.map((item) => (
        <li key={item.id} className={s.card}>
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fit="contain" className={s.icon} loading="lazy" decoding="async" />
          ) : (
            <span className={s.iconEmpty} aria-hidden />
          )}
          <h3 className={s.name}>{item.name}</h3>
          <p className={s.score}>
            <span className={s.scoreLabel}>{SDGS_TEXT.skor}</span>
            <span className={s.scoreValue}>{item.skorLabel}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Kerangka kartu selama data SDGs dimuat: struktur & kelas kartu asli (ikon, nama, skor) dengan teks contoh tak
 * terlihat, jadi tinggi kerangka mengikuti tata letak kartu di tiap breakpoint (ponsel: baris, desktop: 4 kolom).
 */
export function SdgsCardsSkeleton() {
  return (
    <div className={s.grid} role="status" aria-label={SDGS_TEXT.loading}>
      {SDGS_SKELETON_NAME_CHARS.map((chars, i) => (
        <div key={i} className={s.card} aria-hidden>
          <span className={s.iconEmpty} />
          <div className={s.name}>
            <SkeletonText chars={chars} />
          </div>
          <p className={s.score}>
            <span className={s.scoreLabel}>
              <SkeletonText chars={SDGS_SKELETON_SCORE_CHARS.label} />
            </span>
            <span className={s.scoreValue}>
              <SkeletonText chars={SDGS_SKELETON_SCORE_CHARS.value} />
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
