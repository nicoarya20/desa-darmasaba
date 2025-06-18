import prisma from "@/lib/prisma";

export default async function pelayananTelunjukSaktiDesaFindMany() {
    try {
        const data = await prisma.pelayananTelunjukSaktiDesa.findMany({
            where: { isActive: true },
        });

        return {
            success: true,
            message: "Success fetch pelayanan telunjuk sakti desa",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch pelayanan telunjuk sakti desa",
        };
    }
}