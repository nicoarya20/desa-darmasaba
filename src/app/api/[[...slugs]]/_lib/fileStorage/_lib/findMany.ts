import prisma from "@/lib/prisma";
import { Context } from "elysia";

type WhereClause = {
  category?: string;
  isActive?: boolean;
  deletedAt?: null;
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    realName?: { contains: string; mode: 'insensitive' };
  }>;
};

export const fileStorageFindMany = async (context: Context) => {
  try {
    // Get query parameters with defaults
    const page = Math.max(Number(context.query?.page) || 1, 1);
    const limit = 10; // Fixed at 10 items per page
    const category = context.query?.category as string | undefined;
    const search = context.query?.search as string | undefined;
    const skip = (page - 1) * limit;

    // Build where clause with proper TypeScript types
    // Berkas di Sampah (deletedAt terisi) tidak tampil di pustaka file admin.
    const where: WhereClause = { isActive: true, deletedAt: null };
    
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { realName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get paginated data and total count
    const [data, total] = await Promise.all([
      prisma.fileStorage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fileStorage.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error in fileStorageFindMany:', error);
    return {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
};
