import prisma from "@/lib/prisma";
import { Context } from "elysia";

const kategoriProdukDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const kategoriProduk = await prisma.kategoriProduk.delete({
        where: {
            id: id,
        },
    })

    if(!kategoriProduk) {
        return {
            success: false,
            message: "Kategori Produk tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus kategori produk",
        data: kategoriProduk,
    }
}

export default kategoriProdukDelete