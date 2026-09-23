import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateProgramPenghijauan = {
    name: string;
    judul: string;
    deskripsi: string;
    icon: string;
}

export default async function programPenghijauanCreate(context: Context){
    const body = context.body as FormCreateProgramPenghijauan;

    const result = await prisma.programPenghijauan.create({
        data: {
            name: body.name,
            judul: body.judul,
            deskripsi: body.deskripsi,
            icon: body.icon,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan program penghijauan",
        data: result,
    }
}