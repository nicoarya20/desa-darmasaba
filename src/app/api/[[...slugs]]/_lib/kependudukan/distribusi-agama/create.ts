import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.DistribusiAgamaGetPayload<{
    select: {
        agama: true;
        jumlah: true;
        tahun: true;
    }
}>

export default async function distribusiAgamaCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.distribusiAgama.create({
        data: {
            agama: body.agama,
            jumlah: body.jumlah,
            tahun: body.tahun,
        },
        select: {
            id: true,
            agama: true,
            jumlah: true,
            tahun: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan distribusi agama",
        data: created,
    };
}
