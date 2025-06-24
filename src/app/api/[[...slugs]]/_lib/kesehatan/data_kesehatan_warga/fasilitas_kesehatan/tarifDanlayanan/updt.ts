import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function tarifDanLayananUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const { layanan, tarif } = context.body as {
        layanan: string;
        tarif: string;
    }

    const existing = await prisma.tarifDanLayanan.findUnique({
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

    const updated = await prisma.tarifDanLayanan.update({
        where: { id },
        data: {
            layanan: layanan,
            tarif: tarif,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}