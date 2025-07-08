import prisma from "@/lib/prisma";

export default async function grafikJumlahPendudukMiskinFindMany() {
    const res = await prisma.grafikJumlahPendudukMiskin.findMany();
    return {
        data: res,
    };
}