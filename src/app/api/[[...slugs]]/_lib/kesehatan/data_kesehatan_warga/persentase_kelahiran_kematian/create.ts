import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DataKematian_KelahiranGetPayload<{
    select: {
        tahun: true;
        kematianKasar: true;
        kematianBayi: true;
        kelahiranKasar: true;
    };
}>;

export default async function persentaseKelahiranKematianCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.dataKematian_Kelahiran.create({
        data: {
            tahun: body.tahun,
            kematianKasar: body.kematianKasar,
            kematianBayi: body.kematianBayi,
            kelahiranKasar: body.kelahiranKasar,
        }
    })
    return{
        success: true,
        message: "Success create persentase kelahiran kematian",
        data: {
            ...body
        }
    }
}