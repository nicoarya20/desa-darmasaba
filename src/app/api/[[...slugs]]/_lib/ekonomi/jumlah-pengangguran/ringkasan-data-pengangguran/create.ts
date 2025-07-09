import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.RingkasanDataPengangguranGetPayload<{
    select: {
        year: true;
        totalUnemployment: true;
        educatedUnemployment: true;
        percentageEducatedOfTotal: true;
        productiveAgePopulation: true;
        percentageProductiveOfTotal: true;
        percentageChangeFromPreviousYear: true;
    };
}>;

export default async function ringkasanDataPengangguranCreate(context: Context) {
    const body = context.body as FormCreate;

    const existing = await prisma.ringkasanDataPengangguran.findFirst({
        where: {
            year: body.year,
        },
    });

    if (existing) {
        return {
            success: false,
            message: `Data tahun ${body.year} sudah ada.`,
            data: null,
        };
    }

    const created = await prisma.ringkasanDataPengangguran.create({
        data: {
            year: body.year,
            totalUnemployment: body.totalUnemployment,
            educatedUnemployment: body.educatedUnemployment,
            percentageEducatedOfTotal: body.percentageEducatedOfTotal,
            productiveAgePopulation: body.productiveAgePopulation,
            percentageProductiveOfTotal: body.percentageProductiveOfTotal,
            percentageChangeFromPreviousYear: body.percentageChangeFromPreviousYear,
        },
        select: {
            id: true,
            year: true,
            totalUnemployment: true,
            educatedUnemployment: true,
            percentageEducatedOfTotal: true,
            productiveAgePopulation: true,
            percentageProductiveOfTotal: true,
            percentageChangeFromPreviousYear: true,
        },
    });

    return {
        success: true,
        message: "Berhasil menambahkan data ringkasan pengangguran",
        data: created,
    };
}