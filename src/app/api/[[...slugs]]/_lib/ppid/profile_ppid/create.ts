import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfilePPIDGetPayload<{
    select: {
        name: true;
        biodata: true;
        riwayat: true;
        pengalaman: true;
        unggulan: true;
    }
}>
export default async function profilePPIDCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profilePPID.create({
        data: {
            name: body.name,
            biodata: body.biodata,
            riwayat: body.riwayat,
            pengalaman: body.pengalaman,
            unggulan: body.unggulan,
        }
    })

    return {
        success: true,
        message: "Profile PPID Berhasil Dibuat",
        data: {
            ...body,
        }
    }
}