import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseWaktuBiaya } from "@/lib/pelayanan-waktu-biaya";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { parseSopFileId } from "../sop-file";

type FormUpdate = Prisma.PelayananTelunjukSaktiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
        estimasiWaktu: true;
        biaya: true;
        sopFileId: true;
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

        const sop = await parseSopFileId(body.sopFileId);
        if (!sop.ok) {
            return Response.json({ success: false, message: sop.message }, { status: 400 });
        }
        // Berkas SOP lama hanya perlu dibaca bila body mengubah/menghapus SOP.
        const lama = sop.data.sopFileId === undefined
            ? null
            : await prisma.pelayananTelunjukSaktiDesa.findUnique({ where: { id }, select: { sopFile: true } });

        const data = await prisma.pelayananTelunjukSaktiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                link,
                ...waktuBiaya.data,
                ...sop.data,
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
                ...sop.data,
            },
        });

        if (lama?.sopFile && lama.sopFile.id !== sop.data.sopFileId) {
            await removeStoredFile(lama.sopFile, "PelayananTelunjukSaktiDesa");
        }

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