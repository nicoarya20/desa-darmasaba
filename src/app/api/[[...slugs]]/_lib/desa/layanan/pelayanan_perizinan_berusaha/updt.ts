import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PelayananPerizinanBerusahaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
    };
}>;
export default async function pelayananPerizinanBerusahaUpdate(context: Context) {
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
        const existing = await prisma.pelayananPerizinanBerusaha.findUnique({
            where: { id },
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Pelayanan perizinan berusaha tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const updated = await prisma.pelayananPerizinanBerusaha.update({
            where: { id },
            data: {
                name,
                deskripsi,
                link,
            },
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Success update pelayanan perizinan berusaha",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error updating pelayanan perizinan berusaha:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate pelayanan perizinan berusaha",
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}