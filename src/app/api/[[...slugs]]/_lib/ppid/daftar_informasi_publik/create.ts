import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DaftarInformasiPublikGetPayload<{
    select: {
        jenisInformasi: true;
        deskripsi: true;
        tanggal: true;
    }
}>
export default async function daftarInformasiPublikCreate(context: Context) {
    const body = context.body as FormCreate;
    const jumlahData = await prisma.daftarInformasiPublik.count({
        where: { isActive: true }, // hitung data aktif aja
      })
    await prisma.daftarInformasiPublik.create({
        data: {
            nomor: jumlahData + 1,
            jenisInformasi: body.jenisInformasi,
            deskripsi: body.deskripsi,
            tanggal: body.tanggal,
        },
    })
    return {
        success: true,
        message: "Success create daftar informasi publik",
        data: {
            ...body,
        },
    };
}