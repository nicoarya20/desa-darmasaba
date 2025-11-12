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

    const created = await prisma.grafikBerdasarkanUmur.create({
        data: {
            remaja: body.remaja,
            dewasa: body.dewasa,
            orangtua: body.orangtua,
            lansia: body.lansia,
        },
        select: {
            id: true,
            remaja: true,
            dewasa: true,
            orangtua: true,
            lansia: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan grafik berdasarkan umur",
        data: created,
    };
}