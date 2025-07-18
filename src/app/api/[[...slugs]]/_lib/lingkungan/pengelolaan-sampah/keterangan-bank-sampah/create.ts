import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateKeteranganBankSampahTerdekat = {
    name: string;
    alamat: string;
    namaTempatMaps: string;
    lat: number;
    lng: number;
}

export default async function keteranganBankSampahTerdekatCreate(context: Context) {
    const body = context.body as FormCreateKeteranganBankSampahTerdekat;

    const linkPetunjukArah = `https://www.google.com/maps/dir/?api=1&destination=${body.lat},${body.lng}`;

    const created = await prisma.keteranganBankSampahTerdekat.create({
        data: {
            name: body.name,
            alamat: body.alamat,
            namaTempatMaps: body.namaTempatMaps,
            lat: body.lat,
            lng: body.lng,
            linkPetunjukArah,
        },
    });

    return {
        success: true,
        message: "Success create keterangan bank sampah terdekat",
        data: created,
    };
}
