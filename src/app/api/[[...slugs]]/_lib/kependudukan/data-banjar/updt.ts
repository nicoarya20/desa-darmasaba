import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function dataBanjarUpdate(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {nama, penduduk, kk, miskin, tahun} = context.body as {
        nama: string;
        penduduk: number;
        kk: number;
        miskin: number;
        tahun: number;
    }

    const existing = await prisma.dataBanjar.findUnique({
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

    const updated = await prisma.dataBanjar.update({
        where: { id },
        data: {
            nama,
            penduduk,
            kk,
            miskin,
            tahun,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}
