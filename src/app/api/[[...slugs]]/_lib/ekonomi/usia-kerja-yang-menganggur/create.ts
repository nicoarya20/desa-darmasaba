import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikMenganggurBerdasarkanUsiaGetPayload<{
    select: {
        usia18_25: true;
        usia26_35: true;
        usia36_45: true;
        usia46_keatas: true;
    }
}>
export default async function grafikMenganggurBerdasarkanUsiaCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.grafikMenganggurBerdasarkanUsia.create({
        data: {
            usia18_25: body.usia18_25,
            usia26_35: body.usia26_35,
            usia36_45: body.usia36_45,
            usia46_keatas: body.usia46_keatas,
        },
        select: {
            id: true,
            usia18_25: true,
            usia26_35: true,
            usia36_45: true,
            usia46_keatas: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan grafik menganggur berdasarkan usia",
        data: created,
    };
}