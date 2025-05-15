import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PermohonanInformasiPublikGetPayload<{
    select: {
        name: true;
        nik: true;
        email: true;
        notelp: true;
        alamat: true;
        jenisInformasiDimintaId: true;
        caraMemperolehInformasiId: true;
        caraMemperolehSalinanInformasiId: true;
    }
}>
export default async function permohonanInformasiPublikCreate(context: Context) {
    const body = context.body as FormCreate;
    
    await prisma.permohonanInformasiPublik.create({
        data: {
            name: body.name,
            nik: body.nik,
            email: body.email,
            notelp: body.notelp,
            alamat: body.alamat,
            jenisInformasiDimintaId: body.jenisInformasiDimintaId,
            caraMemperolehInformasiId: body.caraMemperolehInformasiId,
            caraMemperolehSalinanInformasiId: body.caraMemperolehSalinanInformasiId,
        }
    })

    return {
        success: true,
        message: "Permohonan Informasi Publik Berhasil Dibuat",
        data: {
            ...body,
        }
    }
}
    