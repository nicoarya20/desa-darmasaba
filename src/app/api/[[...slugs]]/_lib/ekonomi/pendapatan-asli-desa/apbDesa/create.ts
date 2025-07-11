import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    tahun: number;
    pendapatanIds: string[];
    belanjaIds: string[];
    pembiayaanIds: string[];
}

export default async function apbDesaCreate(context: Context) {
    const body = context.body as FormCreate;

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
        message: "Success create apb desa",
        data: created,
    };
}
