import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikHasilKepuasanMasyarakatUpdate(context: Context) {
   const id = context.params?.id;

   if (!id) {
    return {
        success: false,
        message: "Id tidak ditemukan",
    }
   }

   const {label, kepuasan} = context.body as {
    label: string;
    kepuasan: string;
   }

   const existing = await prisma.indeksKepuasanMasyarakat.findUnique({
    where: {
      id: id,
    },
   })

   if (!existing) {
    return {
        success: false,
        message: "Data tidak ditemukan",
    }
   }

   const updated = await prisma.indeksKepuasanMasyarakat.update({
    where: { id },
    data: {
      label,
      kepuasan,
    },
   })

   return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
   }
}