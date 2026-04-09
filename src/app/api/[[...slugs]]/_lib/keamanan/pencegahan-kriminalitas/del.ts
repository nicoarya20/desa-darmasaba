import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const pencegahanKriminalitasDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const pencegahanKriminalitas = await prisma.pencegahanKriminalitas.findUnique({
        where: { id },
    });

    if (!pencegahanKriminalitas) {
        return {
            status: 404,
            success: false,
            message: "Pencegahan kriminalitas tidak ditemukan",
        };
    }

    await prisma.pencegahanKriminalitas.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Pencegahan kriminalitas berhasil dihapus",
    };
};
export default pencegahanKriminalitasDelete;
