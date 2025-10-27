import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function deleteAjukanPermohonan(context: Context) {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            message: "ID tidak diberikan",
        };
    }

    await prisma.ajukanPermohonan.delete({
        where: { id },
    });

    return {
        status: 200,
        message: "Ajukan permohonan berhasil dihapus",
    };
}
