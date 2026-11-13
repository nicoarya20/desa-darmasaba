import { Skeleton } from "@mantine/core";
import { IconDeviceCctv } from "@tabler/icons-react";
import s from "./cctv.module.css";
import { CCTV_TEXT as T } from "./cctv.text";

/** Belum ada titik CCTV sama sekali: satu ubin penjelasan, bukan ubin angka 0 dan peta kosong. */
export function CctvEmpty() {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon} aria-hidden>
        <IconDeviceCctv size={24} stroke={1.75} />
      </span>
      <h2 className={s.emptyTitle}>{T.emptyTitle}</h2>
      <p className={s.emptyBody}>{T.emptyBody}</p>
    </div>
  );
}

/** Galat muat + tombol "Coba lagi" di ubin #f5f5f7. */
export function CctvNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={s.empty} role="alert">
      <p className={s.emptyBody}>{T.failed}</p>
      <button type="button" className={s.retry} onClick={onRetry}>
        {T.retry}
      </button>
    </div>
  );
}

/** Kerangka abu: 3 ubin ringkasan + panel peta selama data dimuat. */
export function CctvSkeleton() {
  return (
    <div className={s.body} role="status" aria-label={T.loading} aria-busy="true">
      <div className={s.summary}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h={196} radius={18} />
        ))}
      </div>
      <Skeleton h={640} radius={18} />
    </div>
  );
}
