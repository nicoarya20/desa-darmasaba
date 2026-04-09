import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    posisi: string;
    namaPerusahaan: string;
    lokasi: string;
    tipePekerjaan: string;
    gaji: string;
    deskripsi: string;
    kualifikasi: string;
    notelp: string;
}

export default async function lowonganKerjaCreate(context: Context) {
    const body = context.body as FormCreate;

    const lowonganKerja = await prisma.lowonganPekerjaan.create({
        data: {
            posisi: body.posisi,
            namaPerusahaan: body.namaPerusahaan,
            lokasi: body.lokasi,
            tipePekerjaan: body.tipePekerjaan,
            gaji: body.gaji,
            deskripsi: body.deskripsi,
            kualifikasi: body.kualifikasi,
            notelp: body.notelp,
        },
    });

    return {
        success: true,
        message: "Sukses menambahkan lowongan kerja",
        data: lowonganKerja,
    };
}
