import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
    tanggal: string;
    jenisKelamin: string;
    alamat: string;
}

export default async function kelahiranCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.kelahiran.create({
        data: {
            nama: body.nama,
            tanggal: new Date(body.tanggal),
            jenisKelamin: body.jenisKelamin,
            alamat: body.alamat,
        },
        select: {
            nama: true,
            tanggal: true,
            jenisKelamin: true,
            alamat: true,
        },
    });
    return {
        success: true,
        message: "Success create kelahiran",
        data: created,
    };
}
    