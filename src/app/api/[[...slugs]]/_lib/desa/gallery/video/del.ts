import prisma from "@/lib/prisma";
import { Context } from "elysia";

const galleryVideoDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const galleryVideo = await prisma.galleryVideo.findUnique({
        where: { id },
    });

    if (!galleryVideo) {
        return {
            status: 404,
            body: "Gallery video tidak ditemukan",
        };
    }
    // Hapus gallery video dari database
    await prisma.galleryVideo.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Gallery video berhasil dihapus",
    };
}
export default galleryVideoDelete;