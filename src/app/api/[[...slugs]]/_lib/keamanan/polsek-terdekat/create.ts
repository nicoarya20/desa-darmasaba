import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PolsekTerdekatGetPayload<{
    select: {
        nama: true;
        jarakKeDesa: true;
        alamat: true;
        nomorTelepon: true;
        jamOperasional: true;
        embedMapUrl: true;
        namaTempatMaps: true;
        alamatMaps: true;
        linkPetunjukArah: true;
        layananPolsekId: true;
    };
}>;
async function polsekTerdekatCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.polsekTerdekat.create({
        data: {
            nama: body.nama,
            jarakKeDesa: body.jarakKeDesa,
            alamat: body.alamat,
            nomorTelepon: body.nomorTelepon,
            jamOperasional: body.jamOperasional,
            embedMapUrl: body.embedMapUrl,
            namaTempatMaps: body.namaTempatMaps,
            alamatMaps: body.alamatMaps,
            linkPetunjukArah: body.linkPetunjukArah,
            layananPolsekId: body.layananPolsekId,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan polsek terdekat",
        data: {
            ...body,
        },
    };
}
export default polsekTerdekatCreate;