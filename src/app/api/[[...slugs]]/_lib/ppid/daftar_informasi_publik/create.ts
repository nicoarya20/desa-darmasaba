import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { rejectUnknownPpidFile } from "../ppid-file";

type FormCreate = {
    jenisInformasi: string;
    deskripsi: string;
    tanggal: string;
    fileId?: string | null;
}
export default async function daftarInformasiPublikCreate(context: Context) {
    const body = context.body as FormCreate;
    const unknownFile = await rejectUnknownPpidFile(context.set, body.fileId);
    if (unknownFile) return unknownFile;
    await prisma.daftarInformasiPublik.create({
        data: { 
            jenisInformasi: body.jenisInformasi,
            deskripsi: body.deskripsi,
            tanggal: new Date(body.tanggal),
            ...(body.fileId ? { fileId: body.fileId } : {}),
        },
    })
    return {
        success: true,
        message: "Sukses menambahkan daftar informasi publik",
        data: {
            ...body,
        },
    };
}