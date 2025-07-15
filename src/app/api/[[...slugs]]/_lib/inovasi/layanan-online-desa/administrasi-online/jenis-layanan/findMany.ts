/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function jenisLayananFindMany() {
    const data = await prisma.jenisLayanan.findMany();
    return { 
        success: true,
        data: data.map((item: any) => {
            return {
                id: item.id,
                nama: item.nama,
                deskripsi: item.deskripsi,
            }
        }),
    };
}