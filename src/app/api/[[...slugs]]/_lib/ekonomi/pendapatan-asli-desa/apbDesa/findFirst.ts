import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function apbDesaFindFirst(context: Context) {
  try {
    // ambil id dari query (?id=xxx) atau dari params (/api/apb-desa/:id)
    const id = context.query?.id || context.params?.id;

    // kalau ada ID, cari berdasarkan ID
    if (id) {
      const data = await prisma.apbDesa.findUnique({
        where: { id: String(id), isActive: true },
        include: {
          pendapatan: true,
          belanja: true,
          pembiayaan: true,
        },
      });

      if (!data) {
        return {
          success: false,
          message: "APB Desa not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "Success fetch APB Desa by ID",
        data,
      };
    }

    // kalau tidak ada ID, ambil data paling baru
    const data = await prisma.apbDesa.findFirst({
      where: { isActive: true },
      include: {
        pendapatan: true,
        belanja: true,
        pembiayaan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!data) {
      return {
        success: false,
        message: "No APB Desa data found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Success fetch latest APB Desa",
      data,
    };
  } catch (e) {
    console.error("Error in apbDesaFindFirst:", e);
    return {
      success: false,
      message: "Failed to fetch APB Desa data",
      data: null,
    };
  }
}
