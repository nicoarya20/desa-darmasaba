import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function sedangMencariKerjaUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const { count, percentageOfTotal, recordedDate } = context.body as {
        count: number;
        percentageOfTotal: number;
        recordedDate: string;
    }

    const existing = await prisma.sedangMencariKerja.findUnique({
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

    const updated = await prisma.sedangMencariKerja.update({
        where: {
            id: id,
        },
        data: {
            count: count,
            percentageOfTotal: percentageOfTotal,
            recordedDate: recordedDate,
        },
    })

    return {
        success: true,
        message: "Berhasil mengupdate data sedang mencari kerja",
        data: updated,
    }
}