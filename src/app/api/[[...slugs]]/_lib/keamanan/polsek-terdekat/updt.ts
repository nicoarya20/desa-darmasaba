import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
    jarakKeDesa: string;
    alamat: string;
    nomorTelepon: string;
    jamOperasional: string;
    embedMapUrl: string;
    namaTempatMaps: string;
    alamatMaps: string;
    linkPetunjukArah: string;
    layananPolsekId: string[];
};

export default async function polsekTerdekatUpdate(context: Context) {
    const id = context.params?.id;
    const body = context.body as FormUpdate;

    if (!id) {
        return {
            success: false,
            message: "ID tidak diberikan",
        };
    }

    // Validate that layananPolsekId is provided and not empty
    if (!body.layananPolsekId || body.layananPolsekId.length === 0) {
        return {
            success: false,
            message: "Pilih minimal 1 layanan polsek",
        };
    }

    // Since the relationship is one-to-many, we'll use the first ID
    const layananPolsekId = body.layananPolsekId[0];

    try {
        // First check if the record exists
        const existing = await prisma.polsekTerdekat.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                success: false,
                message: "Polsek terdekat tidak ditemukan",
            };
        }

        // Update the PolsekTerdekat record with the relationship
        const updated = await prisma.polsekTerdekat.update({
            where: { id },
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
                layananPolsek: {
                    connect: { id: layananPolsekId }
                }
            },
            include: {
                layananPolsek: true
            }
        });

        return {
            success: true,
            message: "Data polsek terdekat berhasil diperbarui",
            data: {
                ...updated,
                layananPolsekId: [layananPolsekId] // Keep it as array for consistency
            },
        };
    } catch (error) {
        console.error("Error updating polsek terdekat:", error);
        return {
            success: false,
            message: "Gagal memperbarui data polsek terdekat"
        };
    }
}