import { Skeleton } from "@mantine/core";
import { IconBackhoe } from "@tabler/icons-react";
import s from "./monev.module.css";
import { MONEV_TEXT } from "./monev.text";

/** Keadaan kosong: belum ada kegiatan pembangunan — satu ubin penjelasan, bukan deretan angka 0. */
export function MonevEmpty() {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon} aria-hidden>
        <IconBackhoe size={24} stroke={1.75} />
      </span>
      <h2 className={s.emptyTitle}>{MONEV_TEXT.emptyTitle}</h2>
      <p className={s.emptyBody}>{MONEV_TEXT.emptyBody}</p>
    </div>
  );
}

/** Pesan galat + tombol coba lagi (di dalam ubin atau panel). */
export function MonevNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={s.notice} role="alert">
      <p>{message}</p>
      <button type="button" className={s.retry} onClick={onRetry}>
        {MONEV_TEXT.retry}
      </button>
    </div>
  );
}

/** Placeholder bentuk kartu ringkasan selama data dimuat. */
export function MonevSummarySkeleton() {
  return (
    <div className={s.summary} role="status" aria-label={MONEV_TEXT.loading}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} h={232} radius={18} />
      ))}
    </div>
  );
}

/** Placeholder baris daftar (kegiatan / dokumen). */
export function RowsSkeleton({ count, label }: { count: number; label: string }) {
  return (
    <div role="status" aria-label={label} style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={72} radius={12} />
      ))}
    </div>
  );
}
