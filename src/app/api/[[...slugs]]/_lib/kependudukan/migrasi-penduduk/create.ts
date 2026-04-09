import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.MigrasiPendudukGetPayload<{
    select: {
        jenis: true;
        nama: true;
        tanggal: true;
        asalTujuan: true;
        alasan: true;
        jenisKelamin: true;
    }
}>

export default async function migrasiPendudukCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.migrasiPenduduk.create({
        data: {
            jenis: body.jenis,
            nama: body.nama,
            tanggal: new Date(body.tanggal),
            asalTujuan: body.asalTujuan,
            alasan: body.alasan,
            jenisKelamin: body.jenisKelamin,
        },
        select: {
            id: true,
            jenis: true,
            nama: true,
            tanggal: true,
            asalTujuan: true,
            alasan: true,
            jenisKelamin: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan migrasi penduduk",
        data: created,
    };
}
