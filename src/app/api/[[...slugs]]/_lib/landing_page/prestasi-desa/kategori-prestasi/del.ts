import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const kategoriPrestasiDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const kategoriPrestasi = await prisma.kategoriPrestasiDesa.delete({
        where: {
            id: id,
        },
    })

    if(!kategoriPrestasi) {
        return {
            success: false,
            message: "Kategori Prestasi tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus kategori prestasi",
        data: kategoriPrestasi,
    }
}

export default kategoriPrestasiDelete
