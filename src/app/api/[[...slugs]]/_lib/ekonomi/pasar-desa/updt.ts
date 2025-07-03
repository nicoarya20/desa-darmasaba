import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

type FormUpdate = {
    nama: string;
    harga: number;
    alamatUsaha: string;
    imageId: string;
    rating: number;
    kategoriId: string[]; // Array of KategoriMakanan IDs
  };

export default async function pasarDesaUpdate(context: Context){
    try {
        const id = context.params?.id;
        const body = context.body as FormUpdate;

        const { nama, harga, alamatUsaha, imageId, rating, kategoriId } = body;
        
        if (!id) {
            return Response.json({
                success: false,
                message: "ID tidak boleh kosong",
            }, { status: 400 });
        }

        const existing = await prisma.pasarDesa.findUnique({
            where: { id },
            include: {
                image: true,
                kategori: true,
            },
        })

        if (!existing) {
            return Response.json({
                success: false,
                message: "Pasar desa tidak ditemukan",
            }, { status: 404 });
        }

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
              try {
                const filePath = path.join(oldImage.path, oldImage.name);
                await fs.unlink(filePath);
                await prisma.fileStorage.delete({
                  where: { id: oldImage.id },
                });
              } catch (err) {
                console.error("Gagal hapus gambar lama:", err);
              }
            }
          }

        // First, update the main PasarDesa record
        await prisma.pasarDesa.update({
            where: { id },
            data: {
                nama,
                harga,
                alamatUsaha,
                imageId,
                rating,
                kategori: {
                    connect: kategoriId.map((id) => ({ id })),
                  },
            },
        });

        // Fetch the updated record with all relations
        const updated = await prisma.pasarDesa.findUnique({
            where: { id },
            include: {
                image: true,
                kategori: true,
            }
        });
        return Response.json({
            success: true,
            message: "Success update pasar desa",
            data: updated,
        }, {
            status: 200,
        });
    } catch (e) {
        console.error("Update error:", e);
        return Response.json({
            success: false,
            message: "Gagal mengupdate pasar desa: " + (e instanceof Error ? e.message : 'Unknown error'),
        }, {
            status: 500,
        });
    }
}