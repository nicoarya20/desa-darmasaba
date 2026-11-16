import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    name: string;
    email: string;
    nomorTelepon: string;
    nik: string;
    judulPengaduan: string;
    lokasiKejadian: string;
    deskripsiPengaduan: string;
    jenisPengaduanId: string;
    imageId: string;
}
export default async function pengaduanMasyarakatCreate(context: Context){
    const body = context.body as FormCreate;

    const created = await prisma.pengaduanMasyarakat.create({
        data: {
            name: body.name,
            email: body.email,
            nomorTelepon: body.nomorTelepon,
            nik: body.nik,
            judulPengaduan: body.judulPengaduan,
            lokasiKejadian: body.lokasiKejadian,
            deskripsiPengaduan: body.deskripsiPengaduan,
            jenisPengaduanId: body.jenisPengaduanId,
            imageId: body.imageId,
        },
        select: { id: true },
    })

    // Hanya id: endpoint publik, jangan gemakan NIK/HP/email pelapor ke respons.
    return {
        success: true,
        message: "Sukses menambahkan pengaduan masyarakat",
        data: { id: created.id },
    }
}