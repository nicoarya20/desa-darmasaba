import type { SampahRow } from "@/lib/sampah/sampah-item";

/** Hasil aksi satu item Sampah; gagal membawa status HTTP. */
export type SampahActionResult = { ok: true; message: string } | { ok: false; status: 404 | 409; message: string };

/** Filter daftar: `scopeId` (null = semua, untuk sumber tanpa scope) + hanya item yang belum melewati retensi. */
export type SampahListFilter = { scopeId: string | null; deletedAfter: Date };

/** Satu sumber item Sampah: entitas koleksi (dokumen/foto) yang soft-delete. */
export interface SampahSource {
  /** Kunci sumber, mis. "dokumen-apbdes" (= `:sumber` di URL untuk sumber yang dilayani `/api/sampah`). */
  readonly key: string;
  /** True bila daftar wajib dibatasi `scopeId` (APBDes = apbdesId, DAK = programId). */
  readonly butuhScope: boolean;
  /** Retensi sumber ini (hari) — DAK bisa ditimpa env. */
  retensiHari(): number;
  /** Jumlah item sesuai filter (dihitung di DB). */
  count(filter: SampahListFilter): Promise<number>;
  /** Item sesuai filter, terbaru dihapus dulu, dipaging di DB. */
  list(filter: SampahListFilter, skip: number, take: number): Promise<SampahRow[]>;
  /** ID item yang `deletedAt` < batas, urut ID, dipaging dengan `afterId` — untuk purge. */
  findIds(deletedBefore: Date, take: number, afterId?: string): Promise<string[]>;
  restore(id: string, now: Date): Promise<SampahActionResult>;
  /** Hapus permanen: baris dulu, lalu berkas (FileStorage + MinIO) bila tidak dirujuk data lain. */
  destroy(id: string): Promise<SampahActionResult>;
}
