/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function dataPendidikanFindMany(context: Context) {
    const page = Number(context.query.page) || 1;
      const limit = Number(context.query.limit) || 10;
      const search = (context.query.search as string) || '';
      const skip = (page - 1) * limit;
    
      const where: any = { isActive: true };
    
      // Tambahkan pencarian (jika ada)
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { jumlah: { contains: search, mode: 'insensitive' } },
        ];
      }
    
      try {
        const [data, total] = await Promise.all([
          prisma.dataPendidikan.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: "asc" }, // opsional, kalau mau urut berdasarkan waktu
          }),
          prisma.dataPendidikan.count({
            where: { isActive: true },
          }),
        ]);
    
        return {
          success: true,
          message: "Success fetch program inovasi with pagination",
          data,
          page,
          totalPages: Math.ceil(total / limit),
          total,
        };
      } catch (e) {
        console.error("Find many paginated error:", e);
        return {
          success: false,
          message: "Failed fetch program inovasi with pagination",
        };
      }
    }