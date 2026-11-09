// Aturan dokumen Desa Anti Korupsi — fungsi & konstanta murni, tanpa I/O,
// dipakai bersama oleh API (Elysia), state admin, dan halaman publik.
import { isFolderChanged, parseFolderRef, type FolderRef } from "./desa-anti-korupsi-folder";

export const DOKUMEN_MAX_PER_PROGRAM = 50;
export const DOKUMEN_JUDUL_MAX_LENGTH = 255;
export const PDF_MIME_TYPE = "application/pdf";

/** Satu dokumen dalam respons API (sudah termasuk info berkas). */
export type DokumenDesaAntiKorupsiView = {
  id: string;
  judul: string;
  urutan: number;
  fileId: string;
  file: { id: string; link: string; realName: string; mimeType: string };
};

/**
 * Satu dokumen di payload create/update: `id` ada = dokumen lama, tanpa `id` = dokumen baru;
 * `folder` = folder tujuan (null/tidak dikirim = "Umum").
 */
export type DokumenInput = { id?: string; fileId: string; judul: string; urutan: number; folder?: FolderRef };

/** Dokumen hasil validasi: `folder` selalu terisi (null = "Umum"). */
export type DokumenParsed = Omit<DokumenInput, "folder"> & { folder: FolderRef };

/** Dokumen aktif yang sudah tersimpan di DB, bahan pembanding sinkronisasi. */
export type DokumenTersimpan = { id: string; fileId: string; judul: string; urutan: number; folderId: string | null };

export type DokumenSyncPlan = {
  create: { fileId: string; judul: string; urutan: number; folder: FolderRef }[];
  update: { id: string; judul: string; urutan: number; folder: FolderRef }[];
  remove: string[];
};

type Fail = { ok: false; message: string };
export type DokumenParseResult = { ok: true; data: DokumenParsed[] } | Fail;
export type DokumenSyncResult = { ok: true; plan: DokumenSyncPlan } | Fail;

const fail = (message: string): Fail => ({ ok: false, message });

/** Apakah mime type berkas bisa dipratinjau sebagai PDF di viewer (iframe). */
export function isPdfMime(mimeType: string | null | undefined): boolean {
  return mimeType === PDF_MIME_TYPE;
}

/** Ekstensi berkas untuk label tipe ("PDF", "DOCX"); fallback subtipe mime, lalu "-". */
export function fileExtension(realName: string | null | undefined, mimeType?: string | null): string {
  const name = realName?.trim() ?? "";
  const dot = name.lastIndexOf(".");
  if (dot > 0 && dot < name.length - 1) return name.slice(dot + 1).toUpperCase();
  const sub = mimeType?.split("/")[1];
  return sub ? sub.toUpperCase() : "-";
}

/** Validasi daftar dokumen dari body request: bentuk, judul, urutan, folder, dan duplikat. */
export function parseDokumenList(input: unknown): DokumenParseResult {
  if (!Array.isArray(input)) return fail("Daftar dokumen tidak valid");
  if (input.length > DOKUMEN_MAX_PER_PROGRAM) {
    return fail(`Maksimal ${DOKUMEN_MAX_PER_PROGRAM} dokumen per program`);
  }

  const data: DokumenParsed[] = [];
  const ids = new Set<string>();
  const fileIds = new Set<string>();

  for (const [index, raw] of input.entries()) {
    const label = `Dokumen #${index + 1}`;
    if (!raw || typeof raw !== "object") return fail(`${label} tidak valid`);
    const { id, fileId, judul, urutan, folder } = raw as Record<string, unknown>;

    if (id !== undefined && (typeof id !== "string" || id.trim() === "")) {
      return fail(`${label}: id tidak valid`);
    }
    if (typeof fileId !== "string" || fileId.trim() === "") {
      return fail(`${label}: file wajib diunggah`);
    }
    if (typeof judul !== "string" || judul.trim() === "") {
      return fail(`${label}: judul wajib diisi`);
    }
    if (judul.trim().length > DOKUMEN_JUDUL_MAX_LENGTH) {
      return fail(`${label}: judul maksimal ${DOKUMEN_JUDUL_MAX_LENGTH} karakter`);
    }
    if (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0) {
      return fail(`${label}: urutan harus bilangan bulat >= 0`);
    }
    const folderRef = parseFolderRef(folder);
    if (!folderRef.ok) return fail(`${label}: ${folderRef.message}`);
    if (id !== undefined && ids.has(id)) return fail(`${label}: dokumen terkirim dua kali`);
    if (fileIds.has(fileId)) return fail(`${label}: file yang sama dipakai dua kali`);

    if (id !== undefined) ids.add(id);
    fileIds.add(fileId);
    data.push({ ...(id !== undefined ? { id } : {}), fileId, judul: judul.trim(), urutan, folder: folderRef.ref });
  }

  return { ok: true, data };
}

/**
 * Hitung sinkronisasi dokumen: dokumen tanpa id → create, dokumen lama yang judul/urutan/folder-nya
 * berubah → update, dokumen lama yang tidak dikirim lagi → remove.
 */
export function planDokumenSync(
  existing: DokumenTersimpan[],
  incoming: DokumenParsed[],
): DokumenSyncResult {
  const byId = new Map(existing.map((d) => [d.id, d]));
  const plan: DokumenSyncPlan = { create: [], update: [], remove: [] };
  const kept = new Set<string>();

  for (const item of incoming) {
    if (item.id === undefined) {
      plan.create.push({ fileId: item.fileId, judul: item.judul, urutan: item.urutan, folder: item.folder });
      continue;
    }
    const saved = byId.get(item.id);
    if (!saved) return fail("Dokumen tidak ditemukan pada program ini");
    if (saved.fileId !== item.fileId) {
      return fail("File dokumen lama tidak bisa diganti; hapus lalu unggah dokumen baru");
    }
    kept.add(item.id);
    const changed =
      saved.judul !== item.judul || saved.urutan !== item.urutan || isFolderChanged(saved.folderId, item.folder);
    if (changed) {
      plan.update.push({ id: item.id, judul: item.judul, urutan: item.urutan, folder: item.folder });
    }
  }

  plan.remove = existing.filter((d) => !kept.has(d.id)).map((d) => d.id);
  return { ok: true, plan };
}
