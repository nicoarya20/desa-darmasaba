import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function visiMisiDesaUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = await context.body as {
            visi: string;
            misi: string;
        };

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }), { status: 400 });
        }

        const existing = await prisma.visiMisiDesa.findUnique({
            where: { id },
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Data tidak ditemukan",
            }), { status: 404 });
        }

        const updated = await prisma.visiMisiDesa.update({
            where: { id },
            data: {
                visi: body.visi,
                misi: body.misi,
            },
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Berhasil memperbarui data",
            data: updated,
        }), { status: 200 });
    } catch (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal memperbarui data: " + (error instanceof Error ? error.message : 'Unknown error'),
        }), { status: 500 });
    }
}