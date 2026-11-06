import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseWaktuBiaya } from "@/lib/pelayanan-waktu-biaya";

type FormUpdate = Prisma.PelayananTelunjukSaktiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
        estimasiWaktu: true;
        biaya: true;
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

        const waktuBiaya = parseWaktuBiaya(body);
        if (!waktuBiaya.ok) {
            return Response.json({ success: false, message: waktuBiaya.message }, { status: 400 });
        }

        const data = await prisma.pelayananTelunjukSaktiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                link,
                ...waktuBiaya.data,
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
                ...waktuBiaya.data,
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