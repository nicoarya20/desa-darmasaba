import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    nama: string;
    deskripsi: string;
    hierarki: number;
}

export default async function posisiOrganisasiCreate(context: Context) {
    const body = context.body as FormCreate;

    if(!body) {
        return {
            success: false,
            message: "Body is required",
        };
    }

    try {
        const posisiOrganisasi = await prisma.posisiOrganisasiBumDes.create({
            data: {
                nama: body.nama,
                deskripsi: body.deskripsi,
                hierarki: body.hierarki,
            },
        });
        return {
            success: true,
            message: "Sukses menambahkan posisi organisasi",
            data: posisiOrganisasi
        };
    } catch (error) {
        console.error("Error creating PosisiOrganisasi:", error);
        throw new Error("Failed to create PosisiOrganisasi: " + (error as Error).message);
    }
}