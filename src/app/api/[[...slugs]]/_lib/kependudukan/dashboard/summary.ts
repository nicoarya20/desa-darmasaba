import prisma from "@/lib/prisma";

export default async function dashboardSummary() {
    try {
        const currentYear = new Date().getFullYear();

        // Get dashboard summary
        const [
            totalPenduduk,
            totalKK,
            totalKelahiran,
            totalKemiskinan,
            dinamikaTerbaru,
            agamaData,
            umurData,
            banjarData
        ] = await Promise.all([
            // Total penduduk - hitung dari data banjar
            prisma.dataBanjar.aggregate({
                where: { isActive: true, tahun: currentYear },
                _sum: { penduduk: true }
            }),
            
            // Total KK
            prisma.dataBanjar.aggregate({
                where: { isActive: true, tahun: currentYear },
                _sum: { kk: true }
            }),
            
            // Total kelahiran tahun ini
            prisma.kelahiran.count({
                where: {
                    isActive: true,
                    tanggal: {
                        gte: new Date(`${currentYear}-01-01`),
                        lte: new Date(`${currentYear}-12-31`),
                    }
                }
            }),
            
            // Total penduduk miskin
            prisma.dataBanjar.aggregate({
                where: { isActive: true, tahun: currentYear },
                _sum: { miskin: true }
            }),

            // Dinamika: total resmi per tahun dari admin (DinamikaPenduduk), tahun terbaru yang ada —
            // data desa biasanya baru lengkap untuk tahun sebelumnya, jadi tidak dikunci ke currentYear.
            prisma.dinamikaPenduduk.findFirst({
                where: { isActive: true },
                orderBy: { tahun: 'desc' },
            }),
            
            // Data agama
            prisma.distribusiAgama.findMany({
                where: { isActive: true, tahun: currentYear },
                orderBy: { jumlah: 'desc' }
            }),
            
            // Data umur
            prisma.distribusiUmur.findMany({
                where: { isActive: true, tahun: currentYear },
                orderBy: { createdAt: 'asc' }
            }),
            
            // Data banjar
            prisma.dataBanjar.findMany({
                where: { isActive: true, tahun: currentYear },
                orderBy: { nama: 'asc' }
            })
        ]);

        return {
            success: true,
            message: "Dashboard summary berhasil diambil",
            data: {
                tahun: currentYear,
                summary: {
                    totalPenduduk: totalPenduduk._sum.penduduk || 0,
                    totalKK: totalKK._sum.kk || 0,
                    totalKelahiran: totalKelahiran,
                    totalKemiskinan: totalKemiskinan._sum.miskin || 0,
                },
                dinamika: dinamikaTerbaru
                    ? {
                        tahun: dinamikaTerbaru.tahun,
                        kelahiran: dinamikaTerbaru.kelahiran,
                        kematian: dinamikaTerbaru.kematian,
                        pindahMasuk: dinamikaTerbaru.masuk,
                        pindahKeluar: dinamikaTerbaru.keluar,
                    }
                    : null,
                agama: agamaData,
                umur: umurData,
                banjar: banjarData,
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat mengambil data dashboard",
            data: null,
        };
    }
}
