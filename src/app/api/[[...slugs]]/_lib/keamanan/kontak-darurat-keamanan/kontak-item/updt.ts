import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
  nama: string;
  nomorTelepon: string;
  icon: string;
};

export default async function kontakItemUpdate(context: Context){
    try {
        const { id } = context.params as { id: string };
        const body = context.body as FormUpdate;
      
        // Update utama
        const updated = await prisma.kontakItem.update({
          where: { id },
          data: {
            nama: body.nama,
            nomorTelepon: body.nomorTelepon,
            icon: body.icon,
          },
        });
      
        return {
          success: true,
          message: "Success update kontak item",
          data: updated,
        };
    } catch (error) {
        console.error("Error updating kontak item:", error);
        return Response.json({
            success: false,
            message: "Terjadi kesalahan saat mengupdate kontak item",
        }, { status: 500 ,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}