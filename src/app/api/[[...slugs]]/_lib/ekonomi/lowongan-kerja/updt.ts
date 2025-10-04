import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    posisi: string;
    namaPerusahaan: string;
    lokasi: string;
    tipePekerjaan: string;
    gaji: string;
    deskripsi: string;
    kualifikasi: string;
    notelp: string;
}

export default async function lowonganKerjaUpdate(context: Context){
    try {
        const id = context.params?.id;
        const body = context.body as FormUpdate;

        const { posisi, namaPerusahaan, lokasi, tipePekerjaan, gaji, deskripsi, kualifikasi, notelp } = body;
        
        if (!id) {
            return Response.json({
                success: false,
                message: "ID tidak boleh kosong",
            }, { status: 400 });
        }

        const existing = await prisma.lowonganPekerjaan.findUnique({
            where: { id },
        });

        if (!existing) {
            return Response.json({
                success: false,
                message: "Lowongan kerja tidak ditemukan",
            }, { status: 404 });
        }

        const updated = await prisma.lowonganPekerjaan.update({
            where: { id },
            data: {
                posisi,
                namaPerusahaan,
                lokasi,
                tipePekerjaan,
                gaji,
                deskripsi,
                kualifikasi,
                notelp,
            },
        });

        return Response.json({
            success: true,
            message: "Success update lowongan kerja",
            data: updated,
        }, { status: 200 });
    } catch (e) {
        console.error("Update error:", e);
        return Response.json({
            success: false,
            message: "Gagal mengupdate lowongan kerja: " + (e instanceof Error ? e.message : 'Unknown error'),
        }, { status: 500 });
    }
}