/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kolaborasiInovasiDelete(context: Context){
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID kolaborasi inovasi diperlukan",
        };
    }

    try {
        const deleted = await prisma.kolaborasiInovasi.delete({
            where: { id },
        });

        return {
            success: true,
            message: "Kolaborasi inovasi berhasil dihapus",
            data: deleted,
        };
    } catch (error: any) {
        console.error("Error delete kolaborasi inovasi:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat menghapus kolaborasi inovasi",
            error: error.message,
        };
    }
}