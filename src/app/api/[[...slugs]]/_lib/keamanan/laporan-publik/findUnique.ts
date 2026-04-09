import type { Context } from "elysia";
import prisma from "@/lib/prisma";

const laporanPublikFindUnique = async (context: Context) => {
    const  id  = context.params.id as string;
    const laporanPublik = await prisma.laporanPublik.findUnique({
        where: {
            id,
        },
        include: {
            penanganan: true,
        },
    })
    if (!laporanPublik) {
        return {
            success: false,
            message: "Laporan publik tidak ditemukan",
        }
    }
    
    return {
        success: true,
        data: laporanPublik,
    }
}
export default laporanPublikFindUnique;