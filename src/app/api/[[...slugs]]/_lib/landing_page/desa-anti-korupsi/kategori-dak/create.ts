import prisma from "@/lib/prisma";
import { Context } from "elysia";


export default async function kategoriDesaAntiKorupsiCreate(context: Context) {
    const body = context.body as {name: string};

    if (!body.name) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    const kategoriDesaAntiKorupsi = await prisma.kategoriDesaAntiKorupsi.create({
        data: {
            name: body.name,
        },
    });
    return {
        success: true,
        message: "Success create kategori desa anti korupsi",
        data: kategoriDesaAntiKorupsi
    };
}
