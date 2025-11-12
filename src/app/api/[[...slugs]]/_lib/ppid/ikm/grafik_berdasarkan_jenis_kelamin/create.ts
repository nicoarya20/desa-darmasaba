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

    const created = await prisma.grafikBerdasarkanJenisKelamin.create({
        data: {
            perempuan: body.perempuan,
            laki: body.laki,
        },
        select: {
            id: true,
            perempuan: true,
            laki: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan grafik berdasarkan jenis kelamin",
        data: created,
    };
}