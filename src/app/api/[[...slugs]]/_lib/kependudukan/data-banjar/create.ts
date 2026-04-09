import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.DataBanjarGetPayload<{
    select: {
        nama: true;
        penduduk: true;
        kk: true;
        miskin: true;
        tahun: true;
    }
}>

export default async function dataBanjarCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.dataBanjar.create({
        data: {
            nama: body.nama,
            penduduk: body.penduduk,
            kk: body.kk,
            miskin: body.miskin,
            tahun: body.tahun,
        },
        select: {
            id: true,
            nama: true,
            penduduk: true,
            kk: true,
            miskin: true,
            tahun: true,
        }
    });
    return {
        success: true,
        message: "Sukses menambahkan data banjar",
        data: created,
    };
}
