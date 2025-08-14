import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    kematianId: string;
    kelahiranId: string;
};

export default async function persentaseKelahiranKematianCreate(context: Context) {
    const body = context.body as FormCreate

    const created = await prisma.dataKematian_Kelahiran.create({
        data: {
            kematianId: body.kematianId,
            kelahiranId: body.kelahiranId,
        },
        select: {
            kematianId: true,
            kelahiranId: true,
        }
    })
    return{
        success: true,
        message: "Success create persentase kelahiran kematian",
        data: created
    }
}