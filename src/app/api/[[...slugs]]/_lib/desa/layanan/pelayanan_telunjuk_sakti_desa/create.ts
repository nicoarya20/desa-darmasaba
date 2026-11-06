import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseWaktuBiaya } from "@/lib/pelayanan-waktu-biaya";

type FormCreate = Prisma.PelayananTelunjukSaktiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
        estimasiWaktu: true;
        biaya: true;
    };
}>;
export default async function pelayananTelunjukSaktiDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    const waktuBiaya = parseWaktuBiaya(body);
    if (!waktuBiaya.ok) {
        return Response.json({ success: false, message: waktuBiaya.message }, { status: 400 });
    }

    await prisma.pelayananTelunjukSaktiDesa.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            link: body.link,
            ...waktuBiaya.data,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan pelayanan telunjuk sakti desa",
        data: {
            ...body,
        },
    };
}