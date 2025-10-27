import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function persentaseKelahiranKematianUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {kematianId, kelahiranId} = context.body as {
        kematianId: string;
        kelahiranId: string;
    }

    const existing = await prisma.dataKematian_Kelahiran.findUnique({
        where: {
            id: id,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const updated = await prisma.dataKematian_Kelahiran.update({
        where: { id },
        data: {
            kematianId,
            kelahiranId,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}