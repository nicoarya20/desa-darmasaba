import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
}

export default async function jenisPengaduanCreate(context: Context){
    const body = context.body as FormCreate;

    await prisma.jenisPengaduan.create({
        data: {
            nama: body.nama,
        }
    })

    return {
        success: true,
        message: "Success create jenis pengaduan",
        data: {
            ...body,
        }
    }
}