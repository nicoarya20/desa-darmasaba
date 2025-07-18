/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function keteranganBankSampahTerdekatFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID keterangan bank sampah terdekat diperlukan",
        };
    }

    try {
        const keteranganBankSampahTerdekat = await prisma.keteranganBankSampahTerdekat.findUnique({
            where: { id },
        });

        if (!keteranganBankSampahTerdekat) {
            return {
                success: false,
                message: "Keterangan bank sampah terdekat tidak ditemukan",
            };
        }

        return {
            success: true,
            data: keteranganBankSampahTerdekat,
        };
    } catch (error: any) {
        console.error("Error findUnique keterangan bank sampah terdekat:", error);
        return {
            success: false,
            message: "Gagal mengambil data keterangan bank sampah terdekat",
            error: error.message,
        };
    }
}