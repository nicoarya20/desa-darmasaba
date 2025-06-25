import prisma from "@/lib/prisma";

export default async function findManyFasilitasKesehatan() {
    try {
        const data = await prisma.fasilitasKesehatan.findMany({
            where: {
                isActive: true,
            },
            include: {
                informasiumum: true,
                layananunggulan: true,
                dokterdantenagamedis: true,
                fasilitaspendukung: true,
                prosedurpendaftaran: true,
                tarifdanlayanan: true,
            }
        })
        return {
            success: true,
            message: "Success fetch fasilitas kesehatan",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch fasilitas kesehatan",
        }
    }
}