import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Di findMany.ts
export default async function programKreatifFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.programKreatif.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.programKreatif.count({
        where: { isActive: true }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Success fetch program kreatif with pagination",
      data,
      page,
      totalPages,
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch program kreatif with pagination",
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
  }
}