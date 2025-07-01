/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

 async function layananPolsekFindMany() {
  const data = await prisma.layananPolsek.findMany();
  return { 
    success: true,
    data: data.map((item: any) => {
      return {
        id: item.id,
        nama: item.nama,
      }
    }),
   };
}

export default layananPolsekFindMany

