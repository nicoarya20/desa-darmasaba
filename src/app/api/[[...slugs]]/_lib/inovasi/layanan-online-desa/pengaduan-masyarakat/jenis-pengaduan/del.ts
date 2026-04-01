import prisma from "@/lib/prisma";
import { Context } from "elysia";

const jenisPengaduanDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const jenisPengaduan = await prisma.jenisPengaduan.delete({
        where: {
            id: id,
        },
    })

    if(!jenisPengaduan) {
        return {
            success: false,
            message: "Jenis pengaduan tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus jenis pengaduan",
        data: jenisPengaduan,
    }
}

export default jenisPengaduanDelete
