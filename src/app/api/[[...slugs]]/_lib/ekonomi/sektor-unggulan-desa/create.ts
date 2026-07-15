import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.SektorUnggulanDesaGetPayload<{
    select: {
        name: true;
        description: true;
        value: true;
    }
}>;
export default async function sektorUnggulanDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    try {
        const created = await prisma.sektorUnggulanDesa.create({
            data: {
                name: body.name,
                description: body.description,
                value: body.value,
            },
            select: {
                id: true,
                name: true,
                description: true,
                value: true,
            }
        });
        return {
            success: true,
            message: "Sukses menambahkan sektor unggulan desa",
            data: created,
        };
    } catch (error) {
        // Nama sektor unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
        return handlePrismaError(error, context);
    }
}
