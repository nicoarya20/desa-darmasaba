import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PembiayaanGetPayload<{
    select: {
        id: true;
        name: true;
        value: true;
    };
}>;

export default async function pembiayaanUpdate(context: Context) {
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

        const existing = await prisma.pembiayaan.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                success: false,
                message: "Pembiayaan tidak ditemukan",
            };
        }

        const updated = await prisma.pembiayaan.update({
            where: { id },
            data: {
                name,
                value,
            }
        });
        return {
            success: true,
            message: "Success update pembiayaan",
            data: updated,
        };
    } catch (error) {
        console.error("Update error:", error);
        return {
            success: false,
            message: "Failed update pembiayaan",
        };
    }
}