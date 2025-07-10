import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.ApbDesaGetPayload<{
    select: {
        id: true;
        tahun: true;
        pendapatanId: true;
        belanjaId: true;
        pembiayaanId: true;
    };
}>;
export default async function apbDesaUpdate(context: Context) {
    try {
        const id = context.params?.id as string; 
        const body = (await context.body) as Omit<FormUpdate, "id">;
        
        const {
            tahun,
            pendapatanId,
            belanjaId,
            pembiayaanId,
        } = body;

        if (!id) {
            return {
                success: false,
                message: "ID tidak boleh kosong",
            };
        }

        const existing = await prisma.apbDesa.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                success: false,
                message: "APB Desa tidak ditemukan",
            };
        }

        const updated = await prisma.apbDesa.update({
            where: { id },
            data: {
                tahun,
                pendapatanId,
                belanjaId,
                pembiayaanId,
            }
        });
        return {
            success: true,
            message: "Success update APB Desa",
            data: updated,
        };
    } catch (error) {
        console.error('Error updating APB Desa:', error);
        context.set.status = 500;
        return { error: 'Failed to update APB Desa'};
    }
    
}