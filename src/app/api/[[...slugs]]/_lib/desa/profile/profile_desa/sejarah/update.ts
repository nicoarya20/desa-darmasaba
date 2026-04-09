import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import type { Context } from "elysia";

export default async function sejarahDesaUpdate(context: Context) {
    // ✅ Authentication check
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
        return authResult.response;
    }

    try {
        const id = context.params?.id as string;
        const body = await context.body as {
            judul: string;
            deskripsi: string;
        };

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }), { status: 400 });
        }

        const existing = await prisma.sejarahDesa.findUnique({
            where: { id },
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Data tidak ditemukan",
            }), { status: 404 });
        }

        const updated = await prisma.sejarahDesa.update({
            where: { id },
            data: {
                judul: body.judul,
                deskripsi: body.deskripsi,
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