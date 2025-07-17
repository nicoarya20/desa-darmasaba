/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pengelolaanSampahFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID pengelolaan sampah diperlukan",
        };
    }

    try {
        const pengelolaanSampah = await prisma.pengelolaanSampah.findUnique({
            where: { id },
        });

        if (!pengelolaanSampah) {
            return {
                success: false,
                message: "Pengelolaan sampah tidak ditemukan",
            };
        }

        return {
            success: true,
            data: pengelolaanSampah,
        };
    } catch (error: any) {
        console.error("Error findUnique pengelolaan sampah:", error);
        return {
            success: false,
            message: "Gagal mengambil data pengelolaan sampah",
            error: error.message,
        };
    }
}