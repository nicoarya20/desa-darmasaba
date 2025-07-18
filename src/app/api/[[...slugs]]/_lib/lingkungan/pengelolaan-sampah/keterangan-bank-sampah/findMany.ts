import prisma from "@/lib/prisma";

export default async function keteranganBankSampahTerdekatFindMany() {
    try {
        const data = await prisma.keteranganBankSampahTerdekat.findMany({
            where: { isActive: true },
        });

        return {
            success: true,
            message: "Success fetch keterangan bank sampah terdekat",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch keterangan bank sampah terdekat",
        };
    }
}