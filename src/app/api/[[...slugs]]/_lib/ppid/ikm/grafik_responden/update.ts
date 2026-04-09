import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikRespondenUpdate(context: Context) {
    const id = context.params?.id;

    if(!id) {
        return {
            success: false,
            message: "ID tidak ditemukan"
        }
    }

    const {sangatbaik, baik, kurangbaik, tidakbaik} = context.body as {
        sangatbaik: string;
        baik: string;
        kurangbaik: string;
        tidakbaik: string;
    }  

    const existing = await prisma.grafikBerdasarkanResponden.findUnique({
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

    const updated = await prisma.grafikBerdasarkanResponden.update({
        where: { id },
        data: {
            sangatbaik,
            baik,
            kurangbaik,
            tidakbaik,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}