import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function respondenDelete(context: Context) {
    const id = context.params?.id as string;

    const responden = await prisma.responden.findUnique({
        where: { id },
        include: {
            jenisKelamin: true,
            rating: true,
            kelompokUmur: true,
        },
    });

    if (!responden) {
        return {
            status: 404,
            success: false,
            message: "Responden tidak ditemukan",
        };
    }

    await prisma.responden.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Sukses Menghapus responden",
};
}