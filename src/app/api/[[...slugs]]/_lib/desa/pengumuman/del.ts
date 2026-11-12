import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

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
            images: { select: { id: true } },
            dokumen: { select: { id: true } },
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

    // Berkas dihapus permanen setelah delete sukses (relasi galeri/dokumen sudah ikut terhapus).
    await removeReleasedFiles("Pengumuman", fileIds(pengumuman.imageId, pengumuman.images, pengumuman.dokumen))

    return {
        status: 200,
        success: true,
        message: "Pengumuman berhasil dihapus",
    }
}

export default pengumumanDelete
