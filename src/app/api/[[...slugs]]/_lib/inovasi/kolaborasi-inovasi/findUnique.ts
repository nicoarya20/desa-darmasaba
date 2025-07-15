/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kolaborasiInovasiFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID kolaborasi inovasi diperlukan",
        };
    }

    try {
        const kolaborasiInovasi = await prisma.kolaborasiInovasi.findUnique({
            where: { id },
            include: {
                image: true,
            }
        });

        if (!kolaborasiInovasi) {
            return {
                success: false,
                message: "Kolaborasi inovasi tidak ditemukan",
            };
        }

        return {
            success: true,
            data: kolaborasiInovasi,
        };
    } catch (error: any) {
        console.error("Error findUnique kolaborasi inovasi:", error);
        return {
            success: false,
            message: "Gagal mengambil data kolaborasi inovasi",
            error: error.message,
        };
    }
}