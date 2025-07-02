import prisma from "@/lib/prisma";
import { Context } from "elysia";

const lowonganKerjaDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const lowonganKerja = await prisma.lowonganPekerjaan.findUnique({
        where: { id },
    });
    
    if (!lowonganKerja) {
        return {
            status: 404,
            body: "Lowongan kerja tidak ditemukan",
        };
    }
    
    await prisma.lowonganPekerjaan.delete({
        where: { id },
    });
    return {
        status: 200,
        success: true,
        message: "Lowongan kerja berhasil dihapus",
    };
};
export default lowonganKerjaDelete;