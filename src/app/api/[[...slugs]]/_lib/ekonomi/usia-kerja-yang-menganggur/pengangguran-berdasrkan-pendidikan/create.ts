import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.GrafikMenganggurBerdasarkanPendidikanGetPayload<{
    select: {
        SD: true;
        SMP: true;
        SMA: true;
        D3: true;
        S1: true;
    }
}>
export default async function grafikMenganggurBerdasarkanPendidikanCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.grafikMenganggurBerdasarkanPendidikan.create({
        data: {
            SD: body.SD,
            SMP: body.SMP,
            SMA: body.SMA,
            D3: body.D3,
            S1: body.S1,
        },
        select: {
            id: true,
            SD: true,
            SMP: true,
            SMA: true,
            D3: true,
            S1: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan grafik menganggur berdasarkan pendidikan",
        data: created,
    };
}