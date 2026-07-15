import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
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
        // Ganti tahun ke tahun APBDes lain yang sudah ada → 409 "Tahun sudah dipakai"
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error('Error updating APB Desa:', error);
        context.set.status = 500;
        return { error: 'Failed to update APB Desa'};
    }

}