import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseWaktuBiaya } from "@/lib/pelayanan-waktu-biaya";

type FormUpdate = Prisma.PelayananPendudukNonPermanenGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        estimasiWaktu: true;
        biaya: true;
    };
}>;
export default async function pelayananPendudukNonPermanenUpdate(context: Context) {
    try {
        const id = context.params?.id;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const { name, deskripsi } = body;

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

        const existing = await prisma.pelayananPendudukNonPermanen.findUnique({
            where: { id },
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Pelayanan penduduk non permanen tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const updated = await prisma.pelayananPendudukNonPermanen.update({
            where: { id },
            data: { name, deskripsi, ...waktuBiaya.data },
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Success update pelayanan penduduk non permanen",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (e) {
        console.error("Update error:", e);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal mengupdate pelayanan penduduk non permanen: " + (e instanceof Error ? e.message : 'Unknown error'),
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}