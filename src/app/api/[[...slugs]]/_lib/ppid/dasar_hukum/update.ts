import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { rejectUnknownPpidFile } from "../ppid-file";

type FormCreate = Prisma.DasarHukumPPIDGetPayload<{
    select: {
        id: true;
        judul: true;
        content: true;
    }
}> & { fileId?: string | null };

/** Simpan Dasar Hukum PPID; `fileId` (opsional) mengganti berkas PDF, tanpa `fileId` berkas lama dibiarkan. */
export default async function dasarHukumPPIDUpdate(context: Context) {
    const body = context.body as FormCreate;

    const unknownFile = await rejectUnknownPpidFile(context.set, body.fileId);
    if (unknownFile) return unknownFile;

    const previous = body.fileId
        ? await prisma.dasarHukumPPID.findUnique({ where: { id: body.id }, select: { fileId: true } })
        : null;

    await prisma.dasarHukumPPID.update({
        where: {
            id: body.id
        },
        data: {
            judul: body.judul,
            content: body.content,
            ...(body.fileId ? { fileId: body.fileId } : {}),
        }
    })

    // Berkas lama dihapus permanen SETELAH relasi dipindah ke berkas baru (bukan sebelumnya: pola bug Maskot).
    if (previous?.fileId && previous.fileId !== body.fileId) {
        await removeStoredFile({ id: previous.fileId }, "DasarHukumPPID");
    }

    return {
        success: true,
        message: "Dasar Hukum PPID Berhasil Dibuat",
    }
}
