import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { parseSatuanPeriodeInput } from "@/lib/sektor-unggulan";

type FormCreate = Prisma.SektorUnggulanDesaGetPayload<{
    select: {
        name: true;
        description: true;
        value: true;
        satuan: true;
        periode: true;
    }
}>;
export default async function sektorUnggulanDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    const extra = parseSatuanPeriodeInput(body);
    if (!extra.ok) {
        context.set.status = 400;
        return { success: false, message: extra.message };
    }

    try {
        const created = await prisma.sektorUnggulanDesa.create({
            data: {
                name: body.name,
                description: body.description,
                value: body.value,
                ...extra.data,
            },
            select: {
                id: true,
                name: true,
                description: true,
                value: true,
                satuan: true,
                periode: true,
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
