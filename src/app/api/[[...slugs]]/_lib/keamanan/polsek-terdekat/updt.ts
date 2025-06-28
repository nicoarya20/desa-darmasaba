import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PolsekTerdekatGetPayload<{
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
export default async function polsekTerdekatUpdate(context: Context) {
    try {
        const id = context.params?.id;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const { nama, jarakKeDesa, alamat, nomorTelepon, jamOperasional, embedMapUrl, namaTempatMaps, alamatMaps, linkPetunjukArah, layananPolsekId } = body;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak diberikan",
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }
        const existing = await prisma.polsekTerdekat.findUnique({
            where: { id },
            include: {
                layananPolsek: true,
            }
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Polsek terdekat tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const updated = await prisma.polsekTerdekat.update({
            where: { id },
            data: {
                nama,
                jarakKeDesa,
                alamat,
                nomorTelepon,
                jamOperasional,
                embedMapUrl,
                namaTempatMaps,
                alamatMaps,
                linkPetunjukArah,
                layananPolsekId,
            },
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Success update polsek terdekat",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error updating polsek terdekat:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate polsek terdekat",
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}