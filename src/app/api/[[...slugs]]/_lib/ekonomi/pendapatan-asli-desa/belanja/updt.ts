import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function belanjaUpdate(context: Context) {
    const id = context.params?.id as string;
    const body = context.body as { name: string; value: number };
  
    if (!id) {
      return { success: false, message: "ID tidak boleh kosong" };
    }
  
    try {
      const existing = await prisma.belanja.findUnique({ where: { id } });
      if (!existing) {
        return { success: false, message: "Data tidak ditemukan" };
      }
  
      const updated = await prisma.belanja.update({
        where: { id },
        data: {
          name: body.name,
          value: body.value,
        },
      });
  
      return {
        success: true,
        message: "Berhasil update belanja",
        data: updated,
      };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, message: "Gagal update belanja" };
    }
  }
  