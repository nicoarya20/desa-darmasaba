import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikBerdasarkanUmurGetPayload<{
    select: {
        remaja: true;
        dewasa: true;
        orangtua: true;
        lansia: true;
    }
}>
export async function grafikBerdasarkanUmurCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.grafikBerdasarkanUmur.create({
        data: {
            remaja: body.remaja,
            dewasa: body.dewasa,
            orangtua: body.orangtua,
            lansia: body.lansia,
        },
    });
    return {
        success: true,
        message: "Success create grafik berdasarkan umur",
        data: {
            ...body,
        },
    };
}