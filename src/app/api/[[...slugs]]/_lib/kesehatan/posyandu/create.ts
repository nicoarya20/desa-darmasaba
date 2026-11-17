import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { alamatPosyanduSchema } from "@/lib/posyandu/posyandu-konten.validation";
import { validationFailure } from "../../_struktur-organisasi/http";

type FormCreate = {
    name: string;
    nomor: string;
    deskripsi: string;
    imageId: string;
    jadwalPelayanan: string;
    banjarId?: string;
    alamat?: string | null;
};
/** POST (admin): tambah posyandu banjar; `alamat` opsional (kosong → null). */
export default async function posyanduCreate(context: Context) {
    const body = context.body as FormCreate;
    const alamat = alamatPosyanduSchema.safeParse(body.alamat);
    if (!alamat.success) return validationFailure(context, alamat.error);

    await prisma.posyandu.create({
        data: {
            name: body.name,
            nomor: body.nomor,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            jadwalPelayanan: body.jadwalPelayanan,
            banjarId: body.banjarId || null,
            alamat: alamat.data ?? null,
        }
    })
    return {
        success: true,
        message: "Sukses menambahkan posyandu",
        data: {
            ...body,
        },
    };
}