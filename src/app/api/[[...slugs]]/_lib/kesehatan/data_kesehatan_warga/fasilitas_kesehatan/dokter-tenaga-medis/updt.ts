import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
    specialist: string;
    jadwal: string;
}

export default async function dokterTenagaMedisUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.dokterdanTenagaMedis.update({
            where: { id },
            data: {
                name: body.name,
                specialist: body.specialist,
                jadwal: body.jadwal,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate data dokter tenaga medis",
            data: result,
        };
    } catch (error) {
        console.error("Error updating data dokter tenaga medis:", error);
        throw new Error("Gagal mengupdate data dokter tenaga medis: " + (error as Error).message);
    }
}