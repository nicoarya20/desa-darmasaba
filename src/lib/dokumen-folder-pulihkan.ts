// Alur pulihkan dokumen ber-folder dari sampah (DAK & APBDes) di atas store per domain — tanpa I/O langsung.
// Aturan tujuan/bentrok ada di `planPulihkan` (src/lib/desa-anti-korupsi-sampah.ts).
import { planPulihkan, type DokumenAktifRingkas } from "./desa-anti-korupsi-sampah";

/** Dokumen di sampah: `scopeId` = program/APBDes pemiliknya; status folder asal & berkasnya. */
export type DokumenSampahRef = {
  id: string;
  scopeId: string;
  fileId: string;
  folderId: string | null;
  folderAktif: boolean;
  fileAktif: boolean;
};

/** Akses tabel dokumen satu domain di dalam transaksi. */
export type PulihkanDokumenStore = {
  /** Dokumen nonaktif dengan `deletedAt > cutoff` (yang lewat retensi dianggap hilang); null bila tidak ada. */
  findSampah(id: string, cutoff: Date): Promise<DokumenSampahRef | null>;
  /** Dokumen aktif milik scope yang sama (bahan cek bentrok & urutan akhir folder). */
  findAktif(scopeId: string): Promise<DokumenAktifRingkas[]>;
  restore(id: string, data: { folderId: string | null; urutan: number }): Promise<unknown>;
};

export type PulihkanDokumenResult =
  | { ok: true; data: { id: string; folderId: string | null } }
  | { ok: false; status: 404 | 409; message: string };

/** Pulihkan ke folder asal (bila masih aktif) atau "Umum" di akhir folder; 404 tidak di sampah, 409 bentrok. */
export async function pulihkanDokumenFolder(
  store: PulihkanDokumenStore,
  id: string,
  cutoff: Date,
): Promise<PulihkanDokumenResult> {
  const doc = await store.findSampah(id, cutoff);
  if (!doc) return { ok: false, status: 404, message: "Dokumen tidak ada di tempat sampah" };

  const plan = planPulihkan(doc, await store.findAktif(doc.scopeId));
  if (!plan.ok) return { ok: false, status: 409, message: plan.message };

  await store.restore(id, { folderId: plan.folderId, urutan: plan.urutan });
  return { ok: true, data: { id: doc.id, folderId: plan.folderId } };
}
