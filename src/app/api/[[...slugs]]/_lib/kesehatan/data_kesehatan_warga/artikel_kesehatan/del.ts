import prisma from "@/lib/prisma";
import { Context } from "elysia";

const artikelKesehatanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            message: "ID tidak ditemukan",
        }
    }

    const artikelKesehatan = await prisma.artikelKesehatan.findUnique({
        where: { id },
        include: {
            introduction: true,
            symptom: true,
            prevention: true,
            firstaid: true,
            mythvsfact: true,
            doctorsign: true,
        }
    })

    if (!artikelKesehatan) {
        return {
            status: 404,
            message: "Artikel kesehatan tidak ditemukan",
        }
    }

    await prisma.artikelKesehatan.delete({ where: { id } })

    return {
        status: 200,
        success: true,
        message: "Artikel kesehatan berhasil dihapus",
    }
}
export default artikelKesehatanDelete;