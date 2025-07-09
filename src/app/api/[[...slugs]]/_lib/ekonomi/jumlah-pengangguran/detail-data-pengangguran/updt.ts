import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function detailDataPengangguranUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const { month, year, totalUnemployment, educatedUnemployment, uneducatedUnemployment, percentageChange } = context.body as {
        month: string;
        year: number;
        totalUnemployment: number;
        educatedUnemployment: number;
        uneducatedUnemployment: number;
        percentageChange: number;
    }

    const duplicate = await prisma.detailDataPengangguran.findFirst({
        where: {
            month,
            year,
            NOT: { id },
        },
    });
      
    if (duplicate) {
        return {
          success: false,
          message: `Data bulan ${month} ${year} sudah ada.`,
        };
      }

    const existing = await prisma.detailDataPengangguran.findUnique({
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

    const updated = await prisma.detailDataPengangguran.update({
        where: { id },
        data: {
            month,
            year,
            totalUnemployment,
            educatedUnemployment,
            uneducatedUnemployment,
            percentageChange,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}