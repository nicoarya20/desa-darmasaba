import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.NilaiKonservasiAdatGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function nilaiKonservasiAdatUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.nilaiKonservasiAdat.update({
        where: {
            id: body.id
        },
        data: {
            judul: body.judul,
            deskripsi: body.deskripsi,
        }
    })

    return {
        success: true,
        message: "Nilai konservasi adat berhasil diupdate",
    }
}