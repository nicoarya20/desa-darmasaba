/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function kategoriDesaAntiKorupsiFindMany() {
    const data = await prisma.kategoriDesaAntiKorupsi.findMany();
    return { 
        success: true,
        data: data.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
            }
        }),
    };
}