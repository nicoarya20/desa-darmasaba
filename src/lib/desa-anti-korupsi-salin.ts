// Salin dokumen Desa Anti Korupsi ke program lain — validasi body & perencanaan murni tanpa I/O.
// Salinan = baris dokumen baru (fileId & judul sama) di akhir folder tujuan; berkas MinIO tidak diduplikasi.
import { DOKUMEN_MAX_PER_PROGRAM } from "./desa-anti-korupsi-dokumen";
import { urutanAkhirFolder, type DokumenAktifRingkas } from "./desa-anti-korupsi-sampah";

/** Maksimal dokumen yang disalin dalam satu permintaan. */
export const SALIN_MAX_DOKUMEN = 50;

type Fail = { ok: false; message: string };

/** Body `POST /dokumen/salin-ke-program` yang sudah tervalidasi (id unik, urutan sesuai kiriman). */
export type SalinInput = { dokumenIds: string[]; targetProgramId: string; targetFolderId: string | null };
export type SalinParseResult = { ok: true; data: SalinInput } | Fail;

const fail = (message: string): Fail => ({ ok: false, message });
const isFilled = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

/** Validasi body salin: 1..50 id dokumen terisi, program tujuan wajib, folder tujuan string atau null. */
export function parseSalinInput(body: unknown): SalinParseResult {
  if (typeof body !== "object" || body === null) return fail("Body permintaan tidak valid");
  const { dokumenIds, targetProgramId, targetFolderId } = body as Record<string, unknown>;
  if (!Array.isArray(dokumenIds) || dokumenIds.length === 0) return fail("Pilih minimal satu dokumen");
  if (dokumenIds.length > SALIN_MAX_DOKUMEN) return fail(`Maksimal ${SALIN_MAX_DOKUMEN} dokumen per salin`);
  if (!dokumenIds.every(isFilled)) return fail("ID dokumen tidak valid");
  if (!isFilled(targetProgramId)) return fail("Program tujuan wajib dipilih");
  if (targetFolderId !== null && !isFilled(targetFolderId)) return fail("Folder tujuan tidak valid");
  return { ok: true, data: { dokumenIds: [...new Set(dokumenIds)], targetProgramId, targetFolderId } };
}

/** Dokumen sumber aktif yang akan disalin. */
export type DokumenSumber = { id: string; desaAntiKorupsiId: string; fileId: string; judul: string };

/** Baris dokumen baru di program tujuan. */
export type SalinanBaru = { fileId: string; judul: string; urutan: number };

/** Gagal rencana: 400 = rujukan dokumen tidak valid, 409 = program tujuan akan melebihi batas. */
export type SalinPlan = { ok: true; create: SalinanBaru[]; skipped: number } | (Fail & { status: 400 | 409 });

/**
 * Rencanakan salinan sesuai urutan `dokumenIds`. Berkas yang sudah ada di folder tujuan (atau sudah
 * direncanakan dari dokumen lain di permintaan ini) dilewati; sisa diberi urutan di akhir folder.
 * Dokumen yang tidak ditemukan/nonaktif, berasal dari program tujuan, atau membuat program penuh ditolak.
 */
export function planSalin(
  input: SalinInput,
  sumber: readonly DokumenSumber[],
  aktifTarget: readonly DokumenAktifRingkas[],
): SalinPlan {
  const byId = new Map(sumber.map((d) => [d.id, d]));
  if (input.dokumenIds.some((id) => !byId.has(id))) {
    return { ...fail("Dokumen tidak ditemukan atau sudah dihapus"), status: 400 };
  }
  if (sumber.some((d) => d.desaAntiKorupsiId === input.targetProgramId)) {
    return { ...fail("Program tujuan harus berbeda dari program asal dokumen"), status: 400 };
  }

  const terpakai = new Set(aktifTarget.filter((d) => d.folderId === input.targetFolderId).map((d) => d.fileId));
  let urutan = urutanAkhirFolder(aktifTarget, input.targetFolderId);
  const create: SalinanBaru[] = [];
  let skipped = 0;

  for (const id of input.dokumenIds) {
    const doc = byId.get(id);
    if (!doc) continue; // tidak terjadi: keberadaan semua id sudah dicek di atas
    if (terpakai.has(doc.fileId)) {
      skipped += 1;
      continue;
    }
    terpakai.add(doc.fileId);
    create.push({ fileId: doc.fileId, judul: doc.judul, urutan: urutan++ });
  }

  if (aktifTarget.length + create.length > DOKUMEN_MAX_PER_PROGRAM) {
    return { ...fail(`Program tujuan akan melebihi ${DOKUMEN_MAX_PER_PROGRAM} dokumen (batas maksimal)`), status: 409 };
  }
  return { ok: true, create, skipped };
}
