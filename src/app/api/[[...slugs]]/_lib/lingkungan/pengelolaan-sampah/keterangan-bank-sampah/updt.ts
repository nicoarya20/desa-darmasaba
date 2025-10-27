/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateKeteranganBankSampahTerdekat = {
    id: string;
    name?: string;
    alamat?: string;
    namaTempatMaps?: string;
    lat?: number;
    lng?: number;
};

export default async function keteranganBankSampahTerdekatUpdate(context: Context) {
    const body = context.body as FormUpdateKeteranganBankSampahTerdekat;
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID keterangan bank sampah terdekat wajib diisi",
        };
    }

    try {
        const updateData: any = {
            name: body.name,
            alamat: body.alamat,
            namaTempatMaps: body.namaTempatMaps,
        };

        if (body.lat !== undefined && body.lng !== undefined) {
            updateData.lat = body.lat;
            updateData.lng = body.lng;
            updateData.linkPetunjukArah = `https://www.google.com/maps/dir/?api=1&destination=${body.lat},${body.lng}`;
        }

        const updated = await prisma.keteranganBankSampahTerdekat.update({
            where: { id },
            data: updateData,
        });

        return {
            success: true,
            message: "Success update keterangan bank sampah terdekat",
            data: updated,
        };
    } catch (error) {
        console.error("Update error:", error);
        return {
            success: false,
            message: "Gagal mengupdate keterangan bank sampah terdekat",
        };
    }
}
