import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const keteranganBankSampahTerdekatDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const keteranganBankSampahTerdekat = await prisma.keteranganBankSampahTerdekat.findUnique({
        where: { id },
    });

    if (!keteranganBankSampahTerdekat) {
        return {
            status: 404,
            body: "Keterangan bank sampah terdekat tidak ditemukan",
        };
    }

    await prisma.keteranganBankSampahTerdekat.delete({
        where: { id },
    });

    return {
        success: true,
        status: 200,
        message: "Keterangan bank sampah terdekat berhasil dihapus",
    };
};

export default keteranganBankSampahTerdekatDelete;