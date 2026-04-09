import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    nama: string;
    nik: string;
    alamat: string;
    nomorKk: string;
    kategoriId: string;
}

export default async function createAjukanPermohonan(context: Context){
    const body = context.body as FormCreate;

    await prisma.ajukanPermohonan.create({
        data: {
            nama: body.nama,
            nik: body.nik,
            alamat: body.alamat,
            nomorKk: body.nomorKk,
            kategoriId: body.kategoriId
        }
    })
    return {
       success: true,
       message: 'Ajukan permohonan berhasil dibuat',
       data: {
        ...body
       }
    }
}