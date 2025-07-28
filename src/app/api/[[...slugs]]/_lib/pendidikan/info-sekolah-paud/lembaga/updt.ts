/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama?: string;
    jenjangId?: string;
  };

  export default async function lembagaPendidikanUpdate(context: Context) {
    const body = context.body as FormUpdate;
  
    const id = context.params.id;
  
    if (!id) {
      return {
        success: false,
        message: "ID lembaga pendidikan wajib diisi",
      };
    }
  
    try {
      const updated = await prisma.lembaga.update({
        where: { id },
        data: {
          nama: body.nama,
          jenjangId: body.jenjangId,
        },
        include: {
          jenjangPendidikan: true,
          siswa: true,
          pengajar: true,
        },
      });
  
      return {
        success: true,
        message: "Lembaga pendidikan berhasil diperbarui",
        data: updated,
      };
    } catch (error: any) {
      console.error("❌ Error update lembaga pendidikan:", error);
      return {
        success: false,
        message: "Gagal memperbarui lembaga pendidikan",
        error: error.message,
      };
    }
  }
