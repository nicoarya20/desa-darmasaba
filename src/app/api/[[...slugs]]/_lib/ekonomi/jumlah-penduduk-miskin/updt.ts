import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function grafikJumlahPendudukMiskinUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const existingData = await prisma.grafikJumlahPendudukMiskin.findUnique({
        where: {
            id: id,
        }
    })

    const {year, totalPoorPopulation} = context.body as {
        year: number;
        totalPoorPopulation: number;
    }

    if (!existingData) {
        return {
            success: false,
            message: "Data tidak ditemukan",
            data: null,
        }
    }

    const updated = await prisma.grafikJumlahPendudukMiskin.update({
        where: {
            id: id,
        },
        data: {
            year: year,
            totalPoorPopulation: totalPoorPopulation,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}
