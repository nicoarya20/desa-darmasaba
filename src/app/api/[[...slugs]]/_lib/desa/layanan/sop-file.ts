import prisma from "@/lib/prisma";

/** Kolom FileStorage yang dikirim ke klien untuk tautan SOP (tanpa path internal MinIO). */
export const SOP_FILE_SELECT = { id: true, link: true, realName: true } as const;

type SopFileResult =
    | { ok: true; data: { sopFileId?: string | null } }
    | { ok: false; message: string };

/**
 * Validasi `sopFileId` dari body: undefined → tidak diubah, null/kosong → hapus tautan, selain itu id harus ada di
 * FileStorage. `data` siap di-spread ke `prisma.*.create/update`; `ok: false` dibalas 400 oleh pemanggil.
 */
export async function parseSopFileId(value: string | null | undefined): Promise<SopFileResult> {
    if (value === undefined) return { ok: true, data: {} };
    if (value === null || value.trim() === "") return { ok: true, data: { sopFileId: null } };

    const file = await prisma.fileStorage.findUnique({ where: { id: value }, select: { id: true } });
    if (!file) return { ok: false, message: "Berkas SOP tidak ditemukan di penyimpanan" };
    return { ok: true, data: { sopFileId: file.id } };
}
