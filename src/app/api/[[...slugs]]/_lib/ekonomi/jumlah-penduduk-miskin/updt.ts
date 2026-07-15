import { Context } from "elysia";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";

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

    try {
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
    } catch (error) {
        // Ganti tahun ke tahun yang sudah ada → 409; error lain di-throw
        return handlePrismaError(error, context);
    }
}
