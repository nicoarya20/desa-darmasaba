import prisma from "@/lib/prisma";
import { Context } from "elysia";

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
        include: {
            programKeamanan: true,
            tipsKeamanan: true,
            videoKeamanan: true,
        }
    });

    if (!pencegahanKriminalitas) {
        return {
            status: 404,
            body: "Pencegahan kriminalitas tidak ditemukan",
        };
    }

    await prisma.pencegahanKriminalitas.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Pencegahan kriminalitas berhasil dihapus",
    };
};
export default pencegahanKriminalitasDelete;
