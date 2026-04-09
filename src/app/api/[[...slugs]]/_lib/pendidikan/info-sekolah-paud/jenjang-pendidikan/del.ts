import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jenjangPendidikanDelete(context: Context) {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const jenjangPendidikan = await prisma.jenjangPendidikan.delete({
        where: {
            id: id,
        },
    })

    if(!jenjangPendidikan) {
        return {
            success: false,
            message: "Jenjang Pendidikan tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus jenjang pendidikan",
        data: jenjangPendidikan,
    }
}
