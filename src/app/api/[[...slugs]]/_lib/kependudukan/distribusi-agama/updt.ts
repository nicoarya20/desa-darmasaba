import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function distribusiAgamaUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {agama, jumlah, tahun} = context.body as {
        agama: string;
        jumlah: number;
        tahun: number;
    }

    const existing = await prisma.distribusiAgama.findUnique({
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

    const updated = await prisma.distribusiAgama.update({
        where: { id },
        data: {
            agama,
            jumlah,
            tahun,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}
