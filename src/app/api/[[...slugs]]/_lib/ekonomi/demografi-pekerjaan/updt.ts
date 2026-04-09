import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function demografiPekerjaanUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {pekerjaan, lakiLaki, perempuan} = context.body as {
        pekerjaan: string;
        lakiLaki: number;
        perempuan: number;
    }

    const existing = await prisma.dataDemografiPekerjaan.findUnique({
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

    const updated = await prisma.dataDemografiPekerjaan.update({
        where: { id },
        data: {
            pekerjaan,
            lakiLaki,
            perempuan,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}