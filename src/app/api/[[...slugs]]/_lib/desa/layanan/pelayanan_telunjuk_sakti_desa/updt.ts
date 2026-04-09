import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormUpdate = Prisma.PelayananTelunjukSaktiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
    };
}>;
export default async function pelayananTelunjukSaktiDesaUpdate(context: Context) {
    try {
        const id = context.params?.id;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const { name, deskripsi, link } = body;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak diberikan",
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const data = await prisma.pelayananTelunjukSaktiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                link,
            },
        });

        if (!data) {
            return new Response(JSON.stringify({
                success: false,
                message: "Gagal update pelayanan telunjuk sakti desa",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const updated = await prisma.pelayananTelunjukSaktiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                link,
            },
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Success update pelayanan telunjuk sakti desa",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal update pelayanan telunjuk sakti desa",
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}