import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function prosedurPendaftaranUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const {content} = context.body as {
        content: string;
    }

    const existing = await prisma.prosedurPendaftaran.findUnique({
        where: {
            id: id,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const updated = await prisma.prosedurPendaftaran.update({
        where: { id },
        data: {
            content: content,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}