/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { hitungAgendaPerBulan } from "@/lib/agenda-desa-waktu";
import { Context } from "elysia";
import { buildEventBudayaWhere, buildRingkasanTahunWhere } from "./filter";

async function eventBudayaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const filter = buildEventBudayaWhere(context.query);
  if (!filter.ok) {
    context.set.status = 400;
    return { success: false, message: filter.message };
  }

  const where: any = filter.where;

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { lokasi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.eventBudaya.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: "asc" },
      }),
      prisma.eventBudaya.count({ where }),
    ]);

    const response = {
      success: true,
      message: "Berhasil mengambil event budaya",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    if (filter.tahun === null) return response;

    // Ringkasan per bulan untuk tahun terpilih (mengikuti filter kategori saja).
    const setahun = await prisma.eventBudaya.findMany({
      where: buildRingkasanTahunWhere(filter.where.kategori, filter.tahun) as any,
      select: { tanggal: true, tanggalSelesai: true },
    });
    return { ...response, ringkasanBulan: hitungAgendaPerBulan(setahun, filter.tahun) };
  } catch (e) {
    console.error("Error di eventBudayaFindMany:", e);
    return { success: false, message: "Gagal mengambil data event budaya" };
  }
}

export default eventBudayaFindMany;
