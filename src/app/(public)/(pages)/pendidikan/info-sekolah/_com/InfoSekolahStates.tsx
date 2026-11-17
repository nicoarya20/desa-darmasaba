import { Skeleton } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import s from "./info-sekolah.module.css";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";

/** Pesan galat + tombol "Coba lagi" di ubin --c-tile. */
export function InfoSekolahNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={s.empty} role="alert">
      <p className={s.emptyText}>{message}</p>
      <button type="button" className={s.retry} onClick={onRetry}>
        {T.retry}
      </button>
    </div>
  );
}

type EmptyProps = { title?: string; message: string; action?: { label: string; onClick: () => void } };

/** Ubin --c-tile berisi satu pesan; `title` + ikon untuk "belum ada data" halaman, `action` = satu tombol pil. */
export function InfoSekolahEmpty({ title, message, action }: EmptyProps) {
  return (
    <div className={s.empty} role="status">
      {title ? (
        <>
          <span className={s.emptyIcon} aria-hidden>
            <IconSchool size={24} stroke={1.75} />
          </span>
          <p className={s.emptyTitle}>{title}</p>
        </>
      ) : null}
      <p className={s.emptyText}>{message}</p>
      {action ? (
        <button type="button" className={s.retry} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

/** Kerangka abu berdenyut: `count` blok setinggi `height`, sebagai grid ringkasan atau tumpukan. */
export function InfoSekolahSkeleton({ label, count, height, grid }: { label: string; count: number; height: number; grid?: boolean }) {
  return (
    <div className={grid ? s.summary : s.skeletonStack} role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={height} radius={grid ? 18 : 12} />
      ))}
    </div>
  );
}
