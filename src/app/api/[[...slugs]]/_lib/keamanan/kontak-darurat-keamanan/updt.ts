import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
    imageId?: string;
    kontakItems: {
      nama: string;
      nomorTelepon: string;
      imageId?: string;
    }[];
  };

export default async function kontakDaruratKeamananUpdate(context: Context){
    try {
        const { id } = context.params as { id: string };
        const body = context.body as FormUpdate;
      
        // Hapus kontakItems lama
        await prisma.kontakItem.deleteMany({
          where: {
            kategoriId: id,
          },
        });
      
        // Update utama
        const updated = await prisma.kontakDaruratKeamanan.update({
          where: { id },
          data: {
            nama: body.nama,
            imageId: body.imageId,
            kontakItems: {
              create: body.kontakItems,
            },
          },
          include: {
            kontakItems: true,
          },
        });
      
        return {
          success: true,
          message: "Success update kontak darurat keamanan",
          data: updated,
        };
    } catch (error) {
        console.error("Error updating kontak darurat keamanan:", error);
        return Response.json({
            success: false,
            message: "Terjadi kesalahan saat mengupdate kontak darurat keamanan",
        }, { status: 500 ,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}