import { Context } from "elysia";
import prisma from "@/lib/prisma";
import { STATUS_MENUNGGU_VERIFIKASI, isModerasiView } from "./moderasi";

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
    // Laporan yang menunggu verifikasi diperlakukan "tidak ditemukan" kecuali untuk tampilan moderasi admin.
    const tertahan = laporanPublik?.status === STATUS_MENUNGGU_VERIFIKASI && !(await isModerasiView(context.query));
    if (!laporanPublik || tertahan) {
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