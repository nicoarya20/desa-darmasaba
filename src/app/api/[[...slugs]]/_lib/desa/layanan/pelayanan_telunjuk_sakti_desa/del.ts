import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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
        include: { sopFile: true },
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

    if (pelayananTelunjukSaktiDesa.sopFile) {
        await removeStoredFile(pelayananTelunjukSaktiDesa.sopFile, "PelayananTelunjukSaktiDesa");
    }

    return {
        status: 200,
        body: "Pelayanan telunjuk sakti desa berhasil dihapus",
    };
}