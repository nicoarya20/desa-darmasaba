import prisma from "@/lib/prisma";
import { Context } from "elysia";

const pengumumanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak ditemukan",
        }
    }

    const pengumuman = await prisma.pengumuman.findUnique({
        where: {id},
        include: {
            CategoryPengumuman: true,
        }
    })

    if (!pengumuman) {
        return {
            status: 404,
            body: "Pengumuman tidak ditemukan",
        }
    }

    await prisma.pengumuman.delete({
        where: {id},
    })

    return {
        status: 200,
        success: true,
        message: "Pengumuman berhasil dihapus",
    }
}

export default pengumumanDelete
