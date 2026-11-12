import type { SampahRow } from "@/lib/sampah/sampah-item";
import type { ServableFile } from "../../../fileStorage/_lib/serveStoredFile";

/** Hasil aksi satu item Sampah; gagal membawa status HTTP. */
export type SampahActionResult = { ok: true; message: string } | { ok: false; status: 404 | 409; message: string };

/** Filter daftar: `kelompok` = "semua" | ID section | "lainnya"; `cari` = teks judul (boleh kosong). */
export type SampahQuery = { kelompok: string; cari: string };

/** Filter ID untuk kosongkan/purge: kelompok + batas `deletedAt` (eksklusif) opsional. */
export type SampahIdQuery = { kelompok: string; deletedBefore?: Date };

/** Satu sumber item Sampah (berkas FileStorage, atau entitas koleksi dokumen/foto yang soft-delete). */
export interface SampahSource {
  /** Prefix ID item, mis. "file", "dak". */
  readonly key: string;
  /** Retensi sumber ini (hari) — DAK bisa ditimpa env. */
  retensiHari(): number;
  /** Jumlah item per ID kelompok (dihitung di DB), sesuai `cari`. */
  countByKelompok(cari: string): Promise<Record<string, number>>;
  /** Maks `take` baris terbaru dihapus sesuai filter. */
  list(query: SampahQuery, take: number): Promise<SampahRow[]>;
  /** ID item (tanpa prefix) urut ID, dipaging dengan `afterId` — untuk kosongkan & purge. */
  findIds(query: SampahIdQuery, take: number, afterId?: string): Promise<string[]>;
  restore(id: string, now: Date): Promise<SampahActionResult>;
  /** Hapus permanen: baris dulu, lalu berkas (FileStorage + MinIO) bila tidak dirujuk data lain. */
  destroy(id: string): Promise<SampahActionResult>;
  /** Berkas item yang sedang di Sampah untuk pratinjau admin; null bila tidak ada. */
  previewFile(id: string): Promise<ServableFile | null>;
}
