import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PencegahanKriminalitasGetPayload<{
    select: {
        id: true;
        programKeamanan: true;
        tipsKeamanan: true;
        videoKeamanan: true;
    }
}>
export default async function pencegahanKriminalitasUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {programKeamanan, tipsKeamanan, videoKeamanan} = body;

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

        const existing = await prisma.pencegahanKriminalitas.findUnique({
            where: { id },
            include: {
                programKeamanan: true,
                tipsKeamanan: true,
                videoKeamanan: true,
            }
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Pencegahan kriminalitas tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        await prisma.programKeamanan.update({
            where: {id: existing.programKeamananId},
            data: {
                nama: programKeamanan.nama,
                deskripsi: programKeamanan.deskripsi,
                slug: programKeamanan.slug,
            }
        });

        await prisma.tipsKeamanan.update({
            where: {id: existing.tipsKeamananId},
            data: {
                judul: tipsKeamanan.judul,
                konten: tipsKeamanan.konten,
                slug: tipsKeamanan.slug,
            }
        });

        await prisma.videoKeamanan.update({
            where: {id: existing.videoKeamananId},
            data: {
                judul: videoKeamanan.judul,
                deskripsi: videoKeamanan.deskripsi,
                videoUrl: videoKeamanan.videoUrl,
                slug: videoKeamanan.slug,
            }
        });

        const updated = await prisma.pencegahanKriminalitas.update({
            where: { id },
            data: {
                programKeamananId: programKeamanan.id,
                tipsKeamananId: tipsKeamanan.id,
                videoKeamananId: videoKeamanan.id,
            }
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Success update pencegahan kriminalitas",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed update pencegahan kriminalitas",
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
