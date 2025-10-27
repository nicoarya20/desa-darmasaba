/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/posisi-organisasi/findManyAll.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function posisiOrganisasiFindManyAll(context: Context) {
  const search = (context.query.search as string) || "";

  // filter default
  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const data = await prisma.posisiOrganisasiPPID.findMany({
      where,
      orderBy: { hierarki: "asc" },
    });

    return {
      success: true,
      message: "Berhasil mengambil semua data posisi organisasi",
      data: data.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        deskripsi: item.deskripsi,
        hierarki: item.hierarki,
      })),
      total: data.length,
    };
  } catch (e) {
    console.error("Find many all error:", e);
    return {
      success: false,
      message: "Gagal mengambil data posisi organisasi",
    };
  }
}

export default posisiOrganisasiFindManyAll;
