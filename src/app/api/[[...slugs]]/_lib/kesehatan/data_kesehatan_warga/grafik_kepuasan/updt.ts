import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikKepuasanUpdate(context: Context) {
    const id = context.params?.id;
    
    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan"
        }
    }

    const {label, jumlah} = context.body as {
        label: string;
        jumlah: string;
    }
    
    const existing = await prisma.grafikKepuasan.findUnique({
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

    const updated = await prisma.grafikKepuasan.update({
        where: { id },
        data: {
            label,
            jumlah,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}