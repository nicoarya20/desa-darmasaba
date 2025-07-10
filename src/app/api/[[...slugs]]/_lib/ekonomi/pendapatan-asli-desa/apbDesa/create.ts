import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    tahun: number;
    pendapatanId: string;
    belanjaId: string;
    pembiayaanId: string;
}

export default async function apbDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.apbDesa.create({
        data: {
            tahun: body.tahun,
            pendapatanId: body.pendapatanId,
            belanjaId: body.belanjaId,
            pembiayaanId: body.pembiayaanId,
        },
        select: {
            id: true,
            tahun: true,
            pendapatanId: true,
            belanjaId: true,
            pembiayaanId: true,
        }
    });
    return {
        success: true,
        message: "Success create apb desa",
        data: created,
    };
}
