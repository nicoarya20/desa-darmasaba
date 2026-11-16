import { ProgramInovasiOverlay } from "./program-overlay/ProgramInovasiOverlay";
import type { ProgramInovasiItem } from "./HeroPrograms";
import { useProgramParam } from "./use-program-param";

/**
 * Menyambungkan `?program=` dengan overlay detail Program Inovasi.
 * Satu-satunya pemakai useSearchParams di hero: wajib dibungkus Suspense oleh pemanggil agar hero tidak tertahan.
 */
export function ProgramOverlaySlot({ items }: { items: readonly ProgramInovasiItem[] }) {
  const { programId, close } = useProgramParam();
  const preview = programId ? items.find((item) => item.id === programId) : undefined;
  return <ProgramInovasiOverlay programId={programId} preview={preview} onClose={close} />;
}
