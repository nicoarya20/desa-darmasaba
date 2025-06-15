import prisma from "@/lib/prisma";

export default async function pelayananSuratKeteranganFindMany() {
    try {
        const data = await prisma.pelayananSuratKeterangan.findMany({
            where: { isActive: true },
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch pelayanan surat keterangan",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch pelayanan surat keterangan",
        };
    }
}