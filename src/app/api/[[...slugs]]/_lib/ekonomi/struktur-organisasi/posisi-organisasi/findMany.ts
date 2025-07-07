/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function posisiOrganisasiFindMany() {
    const data = await prisma.posisiOrganisasi.findMany();

    return {
        success: true,
        message: "Berhasil mengambil semua data posisi organisasi",
        data: data.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            deskripsi: item.deskripsi,
            hierarki: item.hierarki,
        })),
    };
}