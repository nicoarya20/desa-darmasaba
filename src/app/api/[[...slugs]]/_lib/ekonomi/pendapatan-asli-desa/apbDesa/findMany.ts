import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function apbDesaFindMany(context: Context) {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [data, total] = await Promise.all([
            prisma.apbDesa.findMany({
                where: { isActive: true },
                include: {
                    pendapatan: true,
                    belanja: true,
                    pembiayaan: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.apbDesa.count({
                where: { isActive: true }
            })
        ]);

        return {
            success: true,
            message: "Success fetch apb desa with pagination",
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