import prisma from "@/lib/prisma";
import { Context } from "elysia";

const kategoriKegiatanDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const kategoriKegiatan = await prisma.kategoriKegiatan.delete({
        where: {
            id: id,
        },
    })

    if(!kategoriKegiatan) {
        return {
            success: false,
            message: "Kategori Kegiatan tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus kategori produk",
        data: kategoriKegiatan,
    }
}

export default kategoriKegiatanDelete
