import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormCreate = {
    tahun: number;
    pendapatanIds: string[];
    belanjaIds: string[];
    pembiayaanIds: string[];
}

export default async function apbDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    try {
        const created = await prisma.apbDesa.create({
            data: {
                tahun: body.tahun,
                pendapatan: {
                    connect: body.pendapatanIds.map((id) => ({ id })),
                },
                belanja: {
                    connect: body.belanjaIds.map((id) => ({ id })),
                },
                pembiayaan: {
                    connect: body.pembiayaanIds.map((id) => ({ id })),
                },
            },
            select: {
                id: true,
                tahun: true,
                pendapatan: true,
                belanja: true,
                pembiayaan: true,
            }
        });
        return {
            success: true,
            message: "Sukses menambahkan apb desa",
            data: created,
        };
    } catch (error) {
        // Tahun APBDes unik (@@unique([tahun])) → 409 "Tahun sudah dipakai"
        return handlePrismaError(error, context);
    }
}
