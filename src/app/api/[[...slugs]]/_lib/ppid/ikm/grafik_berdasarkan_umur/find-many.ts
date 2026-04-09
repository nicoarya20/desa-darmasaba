import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikBerdasarkanUmurFindMany(context: Context){
     const page = Number(context.query.page) || 1;
     const limit = Number(context.query.limit) || 10;
     const skip = (page - 1) * limit;
   
     try {
       const [data, total] = await Promise.all([
         prisma.grafikBerdasarkanUmur.findMany({
           where: { isActive: true },
           skip,
           take: limit,
           orderBy: { createdAt: 'desc' },
         }),
         prisma.grafikBerdasarkanUmur.count({
           where: { isActive: true }
         })
       ]);
   
       const totalPages = Math.ceil(total / limit);
   
       return {
         success: true,
         message: "Success fetch grafik berdasarkan umur with pagination",
         data,
         page,
         totalPages,
         total,
       };
     } catch (e) {
       console.error("Find many paginated error:", e);
       return {
         success: false,
         message: "Failed fetch grafik berdasarkan umur with pagination",
         data: [],
         page: 1,
         totalPages: 1,
         total: 0,
       };
     }
}