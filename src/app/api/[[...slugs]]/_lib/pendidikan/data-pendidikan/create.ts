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
    const name = body.name.trim();

    const duplicate = await prisma.dataPendidikan.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, isActive: true },
    });

    if (duplicate) {
        return {
            success: false,
            message: `Data pendidikan "${name}" sudah ada.`,
        };
    }

    const created = await prisma.dataPendidikan.create({
        data: {
            name,
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