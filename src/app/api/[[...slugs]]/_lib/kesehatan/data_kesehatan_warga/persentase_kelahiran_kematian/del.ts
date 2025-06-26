import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function persentaseKelahiranKematianDelete(context: Context) {
    const uuid = context.params?.uuid;

    if (!uuid) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const existing = await prisma.dataKematian_Kelahiran.findUnique({
        where: {
            uuid: uuid,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const deleted = await prisma.dataKematian_Kelahiran.delete({
        where: { uuid },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}