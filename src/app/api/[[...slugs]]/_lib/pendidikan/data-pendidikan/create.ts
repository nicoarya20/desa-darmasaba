import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DataPendidikanGetPayload<{
    select: {
        name: true;
        jumlah: true;
    };
}>;
export default async function dataPendidikanCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.dataPendidikan.create({
        data: {
            name: body.name,
            jumlah: body.jumlah,
        },
        select: {
            id: true,
            name: true,
            jumlah: true,
        },
    });

    return {
        success: true,
        message: "Data pendidikan berhasil dibuat",
        data: created,
    };
}