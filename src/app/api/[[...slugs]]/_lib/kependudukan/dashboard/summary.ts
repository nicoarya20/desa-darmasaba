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
            kematianData,
            pindahMasukData,
            pindahKeluarData,
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

            // Kematian data
            prisma.kematian.findMany({
                where: {
                    isActive: true,
                    tanggal: {
                        gte: new Date(`${currentYear}-01-01`),
                        lte: new Date(`${currentYear}-12-31`),
                    }
                },
                orderBy: { tanggal: 'asc' }
            }),
            
            // Pindah masuk
            prisma.migrasiPenduduk.count({
                where: {
                    isActive: true,
                    jenis: 'MASUK',
                    tanggal: {
                        gte: new Date(`${currentYear}-01-01`),
                        lte: new Date(`${currentYear}-12-31`),
                    }
                }
            }),
            
            // Pindah keluar
            prisma.migrasiPenduduk.count({
                where: {
                    isActive: true,
                    jenis: 'KELUAR',
                    tanggal: {
                        gte: new Date(`${currentYear}-01-01`),
                        lte: new Date(`${currentYear}-12-31`),
                    }
                }
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
                dinamika: {
                    kelahiran: totalKelahiran,
                    kematian: kematianData.length,
                    pindahMasuk: pindahMasukData,
                    pindahKeluar: pindahKeluarData,
                },
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
