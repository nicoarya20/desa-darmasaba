import prisma from "@/lib/prisma";
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
        message: "Success create sektor unggulan desa",
        data: created,
    };
}
