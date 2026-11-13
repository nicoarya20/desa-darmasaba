import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const profileMantanPerbekelDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const foto = await prisma.perbekelDariMasaKeMasa.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!foto) {
        return {
            status: 404,
            body: "Foto tidak ditemukan",
        };
    }

    await prisma.perbekelDariMasaKeMasa.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (foto.image) {
        await removeStoredFile(foto.image, "PerbekelDariMasaKeMasa");
    }

    return {
        status: 200,
        body: "Foto berhasil dihapus",
    };
}

export default profileMantanPerbekelDelete
