import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.BelanjaGetPayload<{
    select: {
        id: true;
        name: true;
        value: true;
    };
}>;

export default async function belanjaUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            value,
        } = body;

        if (!id) {
            return {
                success: false,
                message: "ID tidak boleh kosong",
            };
        }

        const existing = await prisma.belanja.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                success: false,
                message: "Belanja tidak ditemukan",
            };
        }

        const updated = await prisma.belanja.update({
            where: { id },
            data: {
                name,
                value,
            }
        });
        return {
            success: true,
            message: "Success update belanja",
            data: updated,
        };
    } catch (error) {
        console.error("Update error:", error);
        return {
            success: false,
            message: "Failed update belanja",
        };
    }
}