import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Context } from "elysia";

export default async function sektorUnggulanDesaUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const {name, description, value} = context.body as {
        name: string;
        description: string;
        value: number;
    }

    const existing = await prisma.sektorUnggulanDesa.findUnique({
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

    try {
        const updated = await prisma.sektorUnggulanDesa.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
                value,
            },
        })

        return {
            success: true,
            message: "Data berhasil diupdate",
            data: updated,
        }
    } catch (error) {
        // Ganti nama ke nama sektor lain yang sudah ada → 409; error lain di-throw
        return handlePrismaError(error, context);
    }
}
