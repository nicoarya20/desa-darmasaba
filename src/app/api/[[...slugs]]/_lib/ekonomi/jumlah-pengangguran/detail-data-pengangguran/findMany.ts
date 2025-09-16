/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function detailDataPengangguranFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    const yearSearch = Number(search);
  
    where.OR = [
      // kalau search bisa diparse jadi number → cocokin year
      ...(isNaN(yearSearch) ? [] : [{ year: yearSearch }]),
      // selalu cocokin month pakai contains
      { month: { contains: search, mode: "insensitive" } },
    ];
  }
  try {
    const monthOrder = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const [data, total] = await Promise.all([
      prisma.detailDataPengangguran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { year: "asc" }, // urut tahun dulu
      }),
      prisma.detailDataPengangguran.count({
        where,
      }),
    ]);
    data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)); 
    
    return {
      success: true,
      message: "Success fetch detail data pengangguran with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch apb desa with pagination",
      data: null,
    };
  }
}
