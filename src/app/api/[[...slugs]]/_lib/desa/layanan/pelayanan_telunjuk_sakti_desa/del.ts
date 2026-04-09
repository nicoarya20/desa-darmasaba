import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pelayananTelunjukSaktiDesaDelete(context: Context) {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const pelayananTelunjukSaktiDesa = await prisma.pelayananTelunjukSaktiDesa.findUnique({
        where: { id },
    });

    if (!pelayananTelunjukSaktiDesa) {
        return {
            status: 404,
            body: "Pelayanan telunjuk sakti desa tidak ditemukan",
        };
    }

    await prisma.pelayananTelunjukSaktiDesa.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Pelayanan telunjuk sakti desa berhasil dihapus",
    };
}