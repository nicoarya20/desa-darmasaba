import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PelayananSuratKeteranganGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
        image2Id: true;
    };
}>;
async function createPelayananSuratKeterangan(context: Context) {
    const body = context.body as FormCreate;

    await prisma.pelayananSuratKeterangan.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            image2Id: body.image2Id,
        },
    });
    return {
        success: true,
        message: "Success create pelayanan surat keterangan",
        data: {
            ...body,
        },
    };
}
export default createPelayananSuratKeterangan