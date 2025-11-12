import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateProgramKreatif = {
    name: string;
    slug: string;
    deskripsi: string;
    icon: string;
}

export default async function programKreatifCreate(context: Context){
    const body = context.body as FormCreateProgramKreatif;

    await prisma.programKreatif.create({
        data: {
            name: body.name,
            slug: body.slug,
            deskripsi: body.deskripsi,
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