import { LAYANAN_PENGADUAN } from "./layanan-online.meta";

/** `?layanan=pengaduan` → formulir pengaduan dibuka saat hub dimuat. */
export function isPengaduanRequested(value: string | null | undefined): boolean {
  return value?.trim() === LAYANAN_PENGADUAN;
}
