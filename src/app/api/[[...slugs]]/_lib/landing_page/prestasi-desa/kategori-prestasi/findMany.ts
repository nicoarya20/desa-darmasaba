/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function kategoriPrestasiFindMany() {
    const data = await prisma.kategoriPrestasiDesa.findMany();
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