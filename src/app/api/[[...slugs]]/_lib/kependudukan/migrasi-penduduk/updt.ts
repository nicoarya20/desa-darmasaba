import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function migrasiPendudukUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {jenis, nama, tanggal, asalTujuan, alasan} = context.body as {
        jenis: string;
        nama: string;
        tanggal: string;
        asalTujuan: string;
        alasan?: string;
    }

    const existing = await prisma.migrasiPenduduk.findUnique({
        where: {
            id: id,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const updated = await prisma.migrasiPenduduk.update({
        where: { id },
        data: {
            jenis: jenis as 'MASUK' | 'KELUAR',
            nama,
            tanggal: new Date(tanggal),
            asal: jenis === 'MASUK' ? asalTujuan : undefined,
            tujuan: jenis === 'KELUAR' ? asalTujuan : undefined,
            alasan,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}
