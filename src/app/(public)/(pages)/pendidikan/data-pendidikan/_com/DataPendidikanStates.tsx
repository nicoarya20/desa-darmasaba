import { Skeleton } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import s from "./data-pendidikan.module.css";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";

/** Belum ada kategori sama sekali: satu ubin penjelasan, tanpa angka 0 atau grafik kosong. */
export function DataPendidikanEmpty() {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon} aria-hidden>
        <IconSchool size={24} stroke={1.75} />
      </span>
      <h2 className={s.emptyTitle}>{T.emptyTitle}</h2>
      <p className={s.emptyBody}>{T.emptyBody}</p>
    </div>
  );
}

/** Galat muat + tombol "Coba lagi" di ubin #f5f5f7. */
export function DataPendidikanNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={s.empty} role="alert">
      <p className={s.emptyBody}>{T.failed}</p>
      <button type="button" className={s.retry} onClick={onRetry}>
        {T.retry}
      </button>
    </div>
  );
}

/** Kerangka abu seukuran panel (kepala + 4 baris) selama data dimuat. */
export function DataPendidikanSkeleton() {
  return (
    <div className={apb.panel} role="status" aria-label={T.loading} aria-busy="true">
      <div className={s.head}>
        <Skeleton h={28} w="60%" radius={8} />
      </div>
      <div className={s.list}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={22} radius={6} />
        ))}
      </div>
    </div>
  );
}
