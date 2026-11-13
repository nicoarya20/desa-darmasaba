import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const pelayananSuratKeteranganDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const pelayananSuratKeterangan = await prisma.pelayananSuratKeterangan.findUnique({
        where: { id },
        include: {
            image: true,
            image2: true,
        },
    });

    if (!pelayananSuratKeterangan) {
        return {
            status: 404,
            body: "Pelayanan surat keterangan tidak ditemukan",
        };
    }

    const deleted = await prisma.pelayananSuratKeterangan.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (pelayananSuratKeterangan.image) {
        await removeStoredFile(pelayananSuratKeterangan.image, "PelayananSuratKeterangan");
    }

    if (pelayananSuratKeterangan.image2) {
        await removeStoredFile(pelayananSuratKeterangan.image2, "PelayananSuratKeterangan");
    }

    return {
        status: 200,
        body: deleted,
    };
};
export default pelayananSuratKeteranganDelete;