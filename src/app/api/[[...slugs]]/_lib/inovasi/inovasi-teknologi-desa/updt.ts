import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import type { InovasiKategori } from "@/lib/inovasi-teknologi/kategori";

type FormUpdate = {
    name: string;
    deskripsi: string;
    imageId: string;
    /** Opsional; tanpa field ini kategori lama dipertahankan (klien lama tetap jalan). */
    kategori?: InovasiKategori;
};

/** Ubah satu entri Inovasi Teknologi Desa; gambar lama dihapus bila diganti. */
export default async function inovasiTeknologiUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as FormUpdate;
    
        const {
            name,
            deskripsi,
            imageId,
            kategori,
        } = body;
    
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak ditemukan",
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const existing = await prisma.inovasiTeknologiDesa.findUnique({
            where: {id},
            include: {
                image: true,
            }
        })
    
        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Inovasi teknologi desa tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const updated = await prisma.inovasiTeknologiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
                kategori,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
        const oldImage = existing.image;
        if (oldImage) {
            await removeStoredFile(oldImage, "InovasiTeknologiDesa");
        }
        }
    
        return new Response(JSON.stringify({
            success: true,
            message: "Inovasi teknologi desa berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error(`Gagal update inovasi teknologi desa ${context.params?.id}:`, error); 
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate inovasi teknologi desa",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    }