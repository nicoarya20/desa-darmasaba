import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    id: string;
    tahun: number;
    pendapatanIds: string[];
    belanjaIds: string[];
    pembiayaanIds: string[];
};
export default async function apbDesaUpdate(context: Context) {
    try {
        const id = context.params?.id as string; 
        const body = (await context.body) as FormUpdate;
        
        const {
            tahun,
            pendapatanIds,
            belanjaIds,
            pembiayaanIds,
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
              pendapatan: {
                set: pendapatanIds.map((id) => ({ id })),
              },
              belanja: {
                set: belanjaIds.map((id) => ({ id })),
              },
              pembiayaan: {
                set: pembiayaanIds.map((id) => ({ id })),
              },
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