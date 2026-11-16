import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { alamatPosyanduSchema } from "@/lib/posyandu/posyandu-konten.validation";

type FormUpdate = {
    name: string;
    nomor: string;
    deskripsi: string;
    imageId: string;
    jadwalPelayanan: string;
    banjarId?: string;
    alamat?: string | null;
};

/** PUT (admin): ubah posyandu banjar; `alamat` tidak dikirim = tidak diubah, kosong = dikosongkan. */
export default async function posyanduUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as FormUpdate;

        const {
            name,
            nomor,
            deskripsi,
            imageId,
            jadwalPelayanan,
            banjarId,
        } = body;

        const alamat = alamatPosyanduSchema.safeParse(body.alamat);
        if (!alamat.success) {
            return Response.json({
                success: false,
                message: alamat.error.issues.map((issue) => issue.message).join("; "),
            }, { status: 400 })
        }

        if(!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const existing = await prisma.posyandu.findUnique({
            where: { id },
            include: {
                image: true,
            }
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Posyandu tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const updated = await prisma.posyandu.update({
            where: { id },
            data: {
                name,
                nomor,
                deskripsi,
                imageId,
                jadwalPelayanan,
                banjarId: banjarId || null,
                alamat: alamat.data,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                await removeStoredFile(oldImage, "Posyandu");
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Posyandu berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating posyandu:", error); 
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat mengupdate posyandu",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}