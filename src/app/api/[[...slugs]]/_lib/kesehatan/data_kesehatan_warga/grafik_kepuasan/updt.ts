import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikKepuasanUpdate(context: Context) {
    const uuid = context.params?.uuid;
    
    if (!uuid) {
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
            uuid: uuid,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const updated = await prisma.grafikKepuasan.update({
        where: { uuid },
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