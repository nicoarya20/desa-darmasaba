import { Skeleton } from "@mantine/core";
import type { ReactNode } from "react";
import { STAT_BARS_VARS } from "./stat-bars.meta";
import panel from "./stat-bars.module.css";
import s from "./stat-bars-states.module.css";
import { STAT_BARS_TEXT } from "./stat-bars.text";

/** Ubin kosong "tempat disediakan": ikon opsional dalam lingkaran tint, judul opsional, satu kalimat. Tanpa angka 0/grafik kosong. */
export function StatBarsEmpty({ icon, title, body }: { icon?: ReactNode; title?: string; body: string }) {
  return (
    <div className={s.empty} style={STAT_BARS_VARS}>
      {icon ? (
        <span className={s.emptyIcon} aria-hidden>
          {icon}
        </span>
      ) : null}
      {title ? <h2 className={s.emptyTitle}>{title}</h2> : null}
      <p className={s.emptyBody}>{body}</p>
    </div>
  );
}

/** Galat muat di ubin `#f5f5f7` (`role="alert"`), dengan pil putih "Coba lagi" bila `onRetry` ada. */
export function StatBarsError({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className={s.empty} style={STAT_BARS_VARS} role="alert">
      <p className={s.emptyBody}>{message}</p>
      {onRetry ? (
        <button type="button" className={s.retry} onClick={onRetry}>
          {retryLabel ?? STAT_BARS_TEXT.retry}
        </button>
      ) : null}
    </div>
  );
}

/** Kerangka abu seukuran panel (kepala + `rows` baris) selama data dimuat. */
export function StatBarsSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <div className={panel.panel} role="status" aria-label={label} aria-busy="true">
      <div className={panel.head}>
        <Skeleton h={28} w="60%" radius={8} />
      </div>
      <div className={panel.list}>
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} h={22} radius={6} />
        ))}
      </div>
    </div>
  );
}
