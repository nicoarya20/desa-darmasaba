import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function persentaseKelahiranKematianUpdate(context: Context) {
    const uuid = context.params?.uuid;

    if (!uuid) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const {tahun, kematianKasar, kematianBayi, kelahiranKasar} = context.body as {
        tahun: string;
        kematianKasar: string;
        kematianBayi: string;
        kelahiranKasar: string;
    }

    const existing = await prisma.dataKematian_Kelahiran.findUnique({
        where: {
            uuid: uuid,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const updated = await prisma.dataKematian_Kelahiran.update({
        where: { uuid },
        data: {
            tahun,
            kematianKasar,
            kematianBayi,
            kelahiranKasar,
        },
    })

    return {
        success: true,
        message: "Data berhasil diupdate",
        data: updated,
    }
}