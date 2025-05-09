import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikBerdasarkanJenisKelaminGetPayload<{
    select: {
        perempuan: true;
        laki: true;
    }
}>
export default async function grafikBerdasarkanJenisKelaminCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.grafikBerdasarkanJenisKelamin.create({
        data: {
            perempuan: body.perempuan,
            laki: body.laki,
        },
    });
    return {
        success: true,
        message: "Success create grafik berdasarkan jenis kelamin",
        data: {
            ...body,
        },
    };
}