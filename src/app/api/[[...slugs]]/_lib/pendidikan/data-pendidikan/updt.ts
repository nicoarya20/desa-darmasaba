import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function dataPendidikanUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const existingData = await prisma.dataPendidikan.findUnique({
        where: {
            id: id,
        }
    })

    const {name: rawName, jumlah} = context.body as {
        name: string;
        jumlah: string;
    }
    const name = rawName.trim();

    if (!existingData) {
        return {
            success: false,
            message: "Data tidak ditemukan",
            data: null,
        }
    }

    const duplicate = await prisma.dataPendidikan.findFirst({
        where: {
            name: { equals: name, mode: "insensitive" },
            isActive: true,
            NOT: { id },
        },
    })

    if (duplicate) {
        return {
            success: false,
            message: `Data pendidikan "${name}" sudah ada.`,
        }
    }

    const updated = await prisma.dataPendidikan.update({
        where: {
            id: id,
        },
        data: {
            name,
            jumlah: jumlah,
        },
    })

    return {
        success: true,
        message: "Data pendidikan berhasil diupdate",
        data: updated,
    }
}
