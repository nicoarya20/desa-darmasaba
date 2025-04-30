import prisma from "@/lib/prisma";

export default async function persentaseKelahiranKematianFindMany() {
    const res = await prisma.dataKematian_Kelahiran.findMany();
    return {
        data: res
    }
}
    