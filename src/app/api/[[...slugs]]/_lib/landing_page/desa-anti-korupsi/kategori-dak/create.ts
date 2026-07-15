import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Context } from "elysia";


export default async function kategoriDesaAntiKorupsiCreate(context: Context) {
    const body = context.body as {name: string};

    if (!body.name) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    try {
        const kategoriDesaAntiKorupsi = await prisma.kategoriDesaAntiKorupsi.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Sukses menambahkan kategori desa anti korupsi",
            data: kategoriDesaAntiKorupsi
        };
    } catch (error) {
        // Nama kategori unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
        return handlePrismaError(error, context);
    }
}
