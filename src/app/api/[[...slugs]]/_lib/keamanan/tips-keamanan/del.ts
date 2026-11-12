import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const menuTipsKeamananDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const tipsKeamanan = await prisma.menuTipsKeamanan.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!tipsKeamanan) {
        return {
            status: 404,
            body: "Tips keamanan tidak ditemukan",
        };
    }

    // Hapus tips keamanan dari database
    const deleted = await prisma.menuTipsKeamanan.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (tipsKeamanan.image) {
        await removeStoredFile(tipsKeamanan.image, "MenuTipsKeamanan");
    }

    return {
        success: true,
        message: "Sukses Menghapus menu tips keamanan",
        data: deleted,
    };
};
export default menuTipsKeamananDelete;