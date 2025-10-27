import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateDataLingkunganDesa = {
    name: string;
    jumlah: string;
    deskripsi: string;
    icon: string;
}
export default async function dataLingkunganDesaCreate(context: Context){
    const body = context.body as FormCreateDataLingkunganDesa;

    await prisma.dataLingkunganDesa.create({
        data: {
            name: body.name,
            jumlah: body.jumlah,
            deskripsi: body.deskripsi,
            icon: body.icon,
        }
    })

    return {
        success: true,
        message: "Success create data lingkungan desa",
        data: {
            ...body,
        }
    }
}