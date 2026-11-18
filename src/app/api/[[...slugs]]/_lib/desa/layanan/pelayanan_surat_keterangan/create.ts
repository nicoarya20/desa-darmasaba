import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseWaktuBiaya } from "@/lib/pelayanan-waktu-biaya";
import { parseSopFileId } from "../sop-file";

type FormCreate = Prisma.PelayananSuratKeteranganGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
        image2Id: true;
        estimasiWaktu: true;
        biaya: true;
        sopFileId: true;
    };
}>;
async function createPelayananSuratKeterangan(context: Context) {
    const body = context.body as FormCreate;

    const waktuBiaya = parseWaktuBiaya(body);
    if (!waktuBiaya.ok) {
        return Response.json({ success: false, message: waktuBiaya.message }, { status: 400 });
    }

    const sop = await parseSopFileId(body.sopFileId);
    if (!sop.ok) {
        return Response.json({ success: false, message: sop.message }, { status: 400 });
    }

    await prisma.pelayananSuratKeterangan.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            image2Id: body.image2Id,
            ...waktuBiaya.data,
            ...sop.data,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan pelayanan surat keterangan",
        data: {
            ...body,
        },
    };
}
export default createPelayananSuratKeterangan