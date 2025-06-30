import prisma from "@/lib/prisma";

export default async function kontakDaruratKeamananFindMany() {
    try {
        const data = await prisma.kontakDaruratKeamanan.findMany({
            where: { isActive: true },
        });

        return {
            success: true,
            message: "Success fetch kontak darurat keamanan",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch kontak darurat keamanan",
        };
    }
}