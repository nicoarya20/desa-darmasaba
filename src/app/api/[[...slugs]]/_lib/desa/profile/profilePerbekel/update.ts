import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfilPerbekelGetPayload<{
    select: {
        id: true;
        biodata: true;
        pengalaman: true;
        pengalamanOrganisasi: true;
        programUnggulan: true;
    }
}>
export default async function profilePerbekelUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profilPerbekel.update({
        where: {
            id: body.id
        },
        data: {
            biodata: body.biodata,
            pengalaman: body.pengalaman,
            pengalamanOrganisasi: body.pengalamanOrganisasi,
            programUnggulan: body.programUnggulan,
        }
    })

    return {
        success: true,
        message: "Profile Perbekel Berhasil Diupdate",
    }
}