import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.KontakDaruratKeamananGetPayload<{
    select: {
        nama: true;
        kontak: true;
        icon: true;
    }
}>
export default async function kontakDaruratUpdate(context: Context){
    try {
        const id = context.params?.id;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {nama, kontak, icon} = body;

        if(!id){
            return Response.json({
                success: false,
                message: "ID tidak diberikan",
            }, { status: 400 });
        }

        const existing = await prisma.kontakDaruratKeamanan.findUnique({
            where: { id },
        });

        if (!existing) {
            return Response.json({
                success: false,
                message: "Kontak darurat keamanan tidak ditemukan",
            }, { status: 404 });
        }
        const updated = await prisma.kontakDaruratKeamanan.update({
            where: { id },
            data: {
                nama,
                kontak,
                icon,
            },
        });

        return Response.json({
            success: true,
            message: "Success update kontak darurat keamanan",
            data: updated,
        }, { status: 200 });
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