import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
    nik: string;
    alamat: string;
    nomorKk: string;
    kategoriId: string;
}

export default async function createAjukanPermohonan(context: Context){
    const body = context.body as FormCreate;

    const result = await prisma.ajukanPermohonan.create({
        data: {
            nama: body.nama,
            nik: body.nik,
            alamat: body.alamat,
            nomorKk: body.nomorKk,
            kategoriId: body.kategoriId
        },
        select: { id: true },
    })
    // Hanya id: endpoint form publik, jangan gemakan nama/NIK/alamat/nomor KK pemohon ke respons.
    return {
       success: true,
       message: 'Ajukan permohonan berhasil dibuat',
       data: { id: result.id },
    }
}