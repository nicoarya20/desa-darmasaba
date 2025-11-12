import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    jenisInformasi: string;
    deskripsi: string;
    tanggal: string;
}
export default async function daftarInformasiPublikCreate(context: Context) {
    const body = context.body as FormCreate;
    await prisma.daftarInformasiPublik.create({
        data: { 
            jenisInformasi: body.jenisInformasi,
            deskripsi: body.deskripsi,
            tanggal: new Date(body.tanggal),
        },
    })
    return {
        success: true,
        message: "Sukses menambahkan daftar informasi publik",
        data: {
            ...body,
        },
    };
}