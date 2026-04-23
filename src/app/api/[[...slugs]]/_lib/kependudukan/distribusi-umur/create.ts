import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DistribusiUmurGetPayload<{
    select: {
        rentangUmur: true;
        jumlah: true;
        tahun: true;
    }
}>

export default async function distribusiUmurCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.distribusiUmur.create({
        data: {
            rentangUmur: body.rentangUmur,
            jumlah: body.jumlah,
            tahun: body.tahun,
        },
        select: {
            id: true,
            rentangUmur: true,
            jumlah: true,
            tahun: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan distribusi umur",
        data: created,
    };
}
