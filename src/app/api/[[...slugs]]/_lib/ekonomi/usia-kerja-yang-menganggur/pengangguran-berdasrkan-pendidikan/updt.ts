import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikMenganggurBerdasarkanPendidikanUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const {SD, SMP, SMA, D3, S1} = context.body as {
        SD: string;
        SMP: string;
        SMA: string;
        D3: string;
        S1: string;
    }

    const existing = await prisma.grafikMenganggurBerdasarkanPendidikan.findUnique({
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

    const updated = await prisma.grafikMenganggurBerdasarkanPendidikan.update({
        where: {
            id: id,
        },
        data: {
            SD: SD,
            SMP: SMP,
            SMA: SMA,
            D3: D3,
            S1: S1,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}