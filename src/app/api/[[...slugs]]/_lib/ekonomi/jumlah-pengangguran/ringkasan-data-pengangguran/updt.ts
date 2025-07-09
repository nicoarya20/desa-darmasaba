import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function ringkasanDataPengangguranUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const { year, totalUnemployment, educatedUnemployment, percentageEducatedOfTotal, productiveAgePopulation, percentageProductiveOfTotal, percentageChangeFromPreviousYear } = context.body as {
        year: number;
        totalUnemployment: number;
        educatedUnemployment: number;
        percentageEducatedOfTotal: number;
        productiveAgePopulation: number;
        percentageProductiveOfTotal: number;
        percentageChangeFromPreviousYear: number;
    }

    const duplicate = await prisma.ringkasanDataPengangguran.findFirst({
        where: {
            year,
            NOT: { id },
        },
    });
      
    if (duplicate) {
        return {
          success: false,
          message: `Data tahun ${year} sudah ada.`,
        };
      }

    const existing = await prisma.ringkasanDataPengangguran.findUnique({
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

    const updated = await prisma.ringkasanDataPengangguran.update({
        where: { id },
        data: {
            year,
            totalUnemployment,
            educatedUnemployment,
            percentageEducatedOfTotal,
            productiveAgePopulation,
            percentageProductiveOfTotal,
            percentageChangeFromPreviousYear,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}
    