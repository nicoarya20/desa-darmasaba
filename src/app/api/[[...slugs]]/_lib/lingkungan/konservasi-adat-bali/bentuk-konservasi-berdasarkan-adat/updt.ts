import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.BentukKonservasiBerdasarkanAdatGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function bentukKonservasiBerdasarkanAdatUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.bentukKonservasiBerdasarkanAdat.update({
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
        message: "Bentuk konservasi berdasarkan adat berhasil diupdate",
    }
}