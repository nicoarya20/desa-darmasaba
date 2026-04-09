import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikMenganggurBerdasarkanUsiaUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const {usia18_25, usia26_35, usia36_45, usia46_keatas} = context.body as {
        usia18_25: string;
        usia26_35: string;
        usia36_45: string;
        usia46_keatas: string;
    }

    const existing = await prisma.grafikMenganggurBerdasarkanUsia.findUnique({
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

    const updated = await prisma.grafikMenganggurBerdasarkanUsia.update({
        where: {
            id: id,
        },
        data: {
            usia18_25: usia18_25,
            usia26_35: usia26_35,
            usia36_45: usia36_45,
            usia46_keatas: usia46_keatas,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}