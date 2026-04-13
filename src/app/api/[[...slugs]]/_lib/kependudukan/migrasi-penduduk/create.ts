import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    jenis: string;
    nama: string;
    tanggal: string;
    asalTujuan: string;
    alasan: string | null;
}

export default async function migrasiPendudukCreate(context: Context) {
    const body = context.body as FormCreate;

    const isMasuk = body.jenis === 'MASUK';

    const created = await prisma.migrasiPenduduk.create({
        data: {
            jenis: body.jenis as 'MASUK' | 'KELUAR',
            nama: body.nama,
            tanggal: new Date(body.tanggal),
            asal: isMasuk ? body.asalTujuan : undefined,
            tujuan: !isMasuk ? body.asalTujuan : undefined,
            alasan: body.alasan,
        },
        select: {
            id: true,
            jenis: true,
            nama: true,
            tanggal: true,
            alasan: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan migrasi penduduk",
        data: created,
    };
}
