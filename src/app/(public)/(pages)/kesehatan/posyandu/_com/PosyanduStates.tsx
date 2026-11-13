import { Skeleton } from "@mantine/core";
import s from "./posyandu.module.css";
import { POSYANDU_TEXT as T } from "./posyandu.text";

/** Pesan galat + tombol "Coba lagi" di ubin #f5f5f7. */
export function PosyanduNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={s.empty} role="alert">
      <p className={s.emptyText}>{message}</p>
      <button type="button" className={s.retry} onClick={onRetry}>
        {T.retry}
      </button>
    </div>
  );
}

/** Ubin #f5f5f7 berisi satu pesan (kosong / tak ada hasil). */
export function PosyanduEmpty({ message }: { message: string }) {
  return (
    <div className={s.empty}>
      <p className={s.emptyText}>{message}</p>
    </div>
  );
}

/** Kerangka abu berdenyut: `count` blok setinggi `height`, disusun sebagai grid ringkasan atau tumpukan baris. */
export function PosyanduSkeleton({ label, count, height, grid }: { label: string; count: number; height: number; grid?: boolean }) {
  return (
    <div className={grid ? s.summary : s.stack} role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={height} radius={grid ? 18 : 12} />
      ))}
    </div>
  );
}
