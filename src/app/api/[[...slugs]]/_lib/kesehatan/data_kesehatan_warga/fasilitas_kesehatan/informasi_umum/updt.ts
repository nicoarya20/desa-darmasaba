import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function informasiumumUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const {fasilitas, alamat, jamOperasional} = context.body as {
        fasilitas: string;
        alamat: string;
        jamOperasional: string;
    }

    const existing = await prisma.informasiUmum.findUnique({
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

    const updated = await prisma.informasiUmum.update({
        where: { id },
        data: {
            fasilitas: fasilitas,
            alamat: alamat,
            jamOperasional: jamOperasional,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}