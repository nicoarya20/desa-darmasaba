/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { compareJenjang } from "@/lib/jenjang-pendidikan-urutan";

export default async function jenjangPendidikanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Opsional (halaman publik): hanya jenjang yang punya lembaga aktif, supaya filter tidak menawarkan jenjang kosong.
  const hasLembaga = context.query.hasLembaga === "true";

  // Buat where clause
  const where: any = { isActive: true };
  if (hasLembaga) where.lembagas = { some: { isActive: true } };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { lembagas: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    // Urutan baku PAUD, TK, SD, SMP, SMA, SMK (lalu lainnya A–Z) untuk admin & publik. Prisma tidak bisa ORDER BY
    // urutan buatan, jadi diurutkan di memori lalu dipotong per halaman — aman karena tabel acuan ini hanya
    // berisi beberapa baris (satu per jenjang).
    const all = await prisma.jenjangPendidikan.findMany({ where });
    const sorted = all.sort((a, b) => compareJenjang(a.nama, b.nama));
    const total = sorted.length;
    const data = sorted.slice(skip, skip + limit);

    return {
      success: true,
      message: "Berhasil ambil jenjang pendidikan dengan pagination",
      data: data.map((item: any) => {
        return {
          id: item.id,
          nama: item.nama,
          lembagas: item.lembagas,
        };
      }),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data jenjang pendidikan",
    };
  }
}
