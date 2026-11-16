import { IconSchool } from "@tabler/icons-react";
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from "@/app/(public)/_com/stat-bars/StatBarsStates";
import { DATA_PENDIDIKAN_TEXT as T } from "./data-pendidikan.text";

/** Belum ada kategori sama sekali: satu ubin penjelasan, tanpa angka 0 atau grafik kosong. */
export function DataPendidikanEmpty() {
  return <StatBarsEmpty icon={<IconSchool size={24} stroke={1.75} />} title={T.emptyTitle} body={T.emptyBody} />;
}

/** Galat muat + tombol "Coba lagi" di ubin #f5f5f7. */
export function DataPendidikanNotice({ onRetry }: { onRetry: () => void }) {
  return <StatBarsError message={T.failed} onRetry={onRetry} retryLabel={T.retry} />;
}

/** Kerangka abu seukuran panel (kepala + 4 baris) selama data dimuat. */
export function DataPendidikanSkeleton() {
  return <StatBarsSkeleton label={T.loading} />;
}
