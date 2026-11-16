import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreateAjukanIdeInovatif = Prisma.AjukanIdeInovatifGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        alamat: true;
        namaIde: true;
        masalah: true;
        benefit: true;
    }
}>
export default async function ajukanIdeInovatifCreate(context: Context){
    const body = context.body as FormCreateAjukanIdeInovatif;

    const result = await prisma.ajukanIdeInovatif.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            alamat: body.alamat,
            namaIde: body.namaIde,
            masalah: body.masalah,
            benefit: body.benefit,
        },
        select: { id: true },
    })

    // Hanya id: endpoint form publik, jangan gemakan nama/alamat pengaju ke respons.
    return {
        success: true,
        message: "Sukses menambahkan ajukan ide inovatif",
        data: { id: result.id },
    }
}