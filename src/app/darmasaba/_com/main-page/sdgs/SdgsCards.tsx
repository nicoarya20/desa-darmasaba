import { Image, Skeleton } from "@mantine/core";
import type { SdgsItem } from "./sdgs.logic";
import { SDGS_TOP_LIMIT } from "./sdgs.meta";
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

/** Placeholder kartu selama data SDGs dimuat. */
export function SdgsCardsSkeleton() {
  return (
    <div className={s.grid} role="status" aria-label={SDGS_TEXT.loading}>
      {Array.from({ length: SDGS_TOP_LIMIT }, (_, i) => (
        <Skeleton key={i} h={248} radius={18} />
      ))}
    </div>
  );
}
