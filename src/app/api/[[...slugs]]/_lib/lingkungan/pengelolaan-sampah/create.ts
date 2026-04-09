import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreatePengelolaanSampah = {
    name: string;
    icon: string;
}

export default async function pengelolaanSampahCreate(context: Context){
    const body = context.body as FormCreatePengelolaanSampah;

    await prisma.pengelolaanSampah.create({
        data: {
            name: body.name,
            icon: body.icon,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan program kreatif",
        data: {
            ...body,
        }
    }
}