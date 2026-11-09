// Aturan "folder" dokumen Desa Anti Korupsi — fungsi & konstanta murni, tanpa I/O,
// dipakai bersama oleh API (Elysia), state admin, dan halaman publik.
import type { Prisma } from "@prisma/client";

export const DOKUMEN_MAX_PER_PROGRAM = 50;
export const DOKUMEN_JUDUL_MAX_LENGTH = 255;
export const PDF_MIME_TYPE = "application/pdf";

/** Include Prisma standar untuk respons program: kategori + dokumen aktif urut `urutan`. */
export const DESA_ANTI_KORUPSI_INCLUDE = {
  kategori: true,
  dokumen: {
    where: { isActive: true },
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      judul: true,
      urutan: true,
      fileId: true,
      file: { select: { id: true, link: true, realName: true, mimeType: true } },
    },
  },
} satisfies Prisma.DesaAntiKorupsiInclude;

/** Program Desa Anti Korupsi beserta kategori dan isi folder dokumennya. */
export type DesaAntiKorupsiWithDokumen = Prisma.DesaAntiKorupsiGetPayload<{
  include: typeof DESA_ANTI_KORUPSI_INCLUDE;
}>;

/** Satu dokumen dalam respons API (sudah termasuk info berkas). */
export type DokumenDesaAntiKorupsiView = DesaAntiKorupsiWithDokumen["dokumen"][number];

/** Satu dokumen di payload create/update: `id` ada = dokumen lama, tanpa `id` = dokumen baru. */
export type DokumenInput = { id?: string; fileId: string; judul: string; urutan: number };

/** Dokumen aktif yang sudah tersimpan di DB, bahan pembanding sinkronisasi. */
export type DokumenTersimpan = { id: string; fileId: string; judul: string; urutan: number };

export type DokumenSyncPlan = {
  create: { fileId: string; judul: string; urutan: number }[];
  update: { id: string; judul: string; urutan: number }[];
  remove: string[];
};

type Fail = { ok: false; message: string };
export type DokumenParseResult = { ok: true; data: DokumenInput[] } | Fail;
export type DokumenSyncResult = { ok: true; plan: DokumenSyncPlan } | Fail;

const fail = (message: string): Fail => ({ ok: false, message });

/** Apakah mime type berkas bisa dipratinjau sebagai PDF di viewer (iframe). */
export function isPdfMime(mimeType: string | null | undefined): boolean {
  return mimeType === PDF_MIME_TYPE;
}

/** Validasi daftar dokumen dari body request: bentuk, judul, urutan, dan duplikat. */
export function parseDokumenList(input: unknown): DokumenParseResult {
  if (!Array.isArray(input)) return fail("Daftar dokumen tidak valid");
  if (input.length > DOKUMEN_MAX_PER_PROGRAM) {
    return fail(`Maksimal ${DOKUMEN_MAX_PER_PROGRAM} dokumen per program`);
  }

  const data: DokumenInput[] = [];
  const ids = new Set<string>();
  const fileIds = new Set<string>();

  for (const [index, raw] of input.entries()) {
    const label = `Dokumen #${index + 1}`;
    if (!raw || typeof raw !== "object") return fail(`${label} tidak valid`);
    const { id, fileId, judul, urutan } = raw as Record<string, unknown>;

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
    if (id !== undefined && ids.has(id)) return fail(`${label}: dokumen terkirim dua kali`);
    if (fileIds.has(fileId)) return fail(`${label}: file yang sama dipakai dua kali`);

    if (id !== undefined) ids.add(id);
    fileIds.add(fileId);
    data.push({ ...(id !== undefined ? { id } : {}), fileId, judul: judul.trim(), urutan });
  }

  return { ok: true, data };
}

/**
 * Hitung sinkronisasi folder: dokumen tanpa id → create, dokumen lama yang judul/urutannya
 * berubah → update, dokumen lama yang tidak dikirim lagi → remove.
 */
export function planDokumenSync(
  existing: DokumenTersimpan[],
  incoming: DokumenInput[],
): DokumenSyncResult {
  const byId = new Map(existing.map((d) => [d.id, d]));
  const plan: DokumenSyncPlan = { create: [], update: [], remove: [] };
  const kept = new Set<string>();

  for (const item of incoming) {
    if (item.id === undefined) {
      plan.create.push({ fileId: item.fileId, judul: item.judul, urutan: item.urutan });
      continue;
    }
    const saved = byId.get(item.id);
    if (!saved) return fail("Dokumen tidak ditemukan pada program ini");
    if (saved.fileId !== item.fileId) {
      return fail("File dokumen lama tidak bisa diganti; hapus lalu unggah dokumen baru");
    }
    kept.add(item.id);
    if (saved.judul !== item.judul || saved.urutan !== item.urutan) {
      plan.update.push({ id: item.id, judul: item.judul, urutan: item.urutan });
    }
  }

  plan.remove = existing.filter((d) => !kept.has(d.id)).map((d) => d.id);
  return { ok: true, plan };
}
