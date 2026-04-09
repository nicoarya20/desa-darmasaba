import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function distribusiUmurUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {rentangUmur, jumlah, tahun} = context.body as {
        rentangUmur: string;
        jumlah: number;
        tahun: number;
    }

    const existing = await prisma.distribusiUmur.findUnique({
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

    const updated = await prisma.distribusiUmur.update({
        where: { id },
        data: {
            rentangUmur,
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
