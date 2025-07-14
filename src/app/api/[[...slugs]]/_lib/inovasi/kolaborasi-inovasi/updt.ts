/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateKolaborasiInovasi = {
    id: string;
    name?: string;
    tahun?: number;
    slug?: string;
    deskripsi?: string;
    kolaborator?: string;
    imageId?: string;
};
export default async function kolaborasiInovasiUpdate(context: Context) {
    const body = context.body as FormUpdateKolaborasiInovasi;
    const id = context.params?.id; // ambil dari URL param
  
    if (!id) {
      return {
        success: false,
        message: "ID kolaborasi inovasi wajib diisi",
      };
    }
  
    try {
      const updated = await prisma.kolaborasiInovasi.update({
        where: { id },
        data: {
          name: body.name,
          tahun: body.tahun,
          slug: body.slug,
          deskripsi: body.deskripsi,
          kolaborator: body.kolaborator,
          imageId: body.imageId,
        },
      });
  
      return {
        success: true,
        message: "Kolaborasi inovasi berhasil diupdate",
        data: updated,
      };
    } catch (error: any) {
      console.error("Error update kolaborasi inovasi:", error);
      return {
        success: false,
        message: "Gagal mengupdate kolaborasi inovasi",
        error: error.message,
      };
    }
  }