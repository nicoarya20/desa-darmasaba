import prisma from "@/lib/prisma"

const laporanPublikFindMany = async () => {
    const laporanPublik = await prisma.laporanPublik.findMany({
        include: {
            penanganan: true
        },
        orderBy: {
            tanggalWaktu: 'desc'
        }
    })
    
    return {
        success: true,
        data: laporanPublik,
    }

}
export default laporanPublikFindMany;
    