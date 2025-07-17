/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function jenisPengaduanFindMany() {
    const data = await prisma.jenisPengaduan.findMany();
    return { 
        success: true,
        data: data.map((item: any) => {
            return {
                id: item.id,
                nama: item.nama,
            }
        }),
    };
}