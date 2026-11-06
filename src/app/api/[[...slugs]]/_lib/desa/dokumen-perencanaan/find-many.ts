import prisma from "@/lib/prisma";
import {
  JENIS_DOKUMEN,
  TAHUN_MAX,
  TAHUN_MIN,
  isJenisDokumen,
} from "@/lib/dokumen-perencanaan";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { FILE_SELECT } from "./file-check";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/** Daftar publik dokumen perencanaan: terpaginasi, filter jenis/tahun/pencarian. */
async function dokumenPerencanaanFindMany(context: Context) {
  const page = Math.max(1, Math.floor(Number(context.query.page)) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(context.query.limit)) || DEFAULT_LIMIT));
  const jenis = (context.query.jenis as string) || "";
  const tahunRaw = (context.query.tahun as string) || "";
  const search = ((context.query.search as string) || "").trim();

  if (jenis && !isJenisDokumen(jenis)) {
    context.set.status = 400;
    return { success: false, message: `Jenis harus salah satu dari: ${JENIS_DOKUMEN.join(", ")}` };
  }

  const tahun = Number(tahunRaw);
  if (tahunRaw && (!Number.isInteger(tahun) || tahun < TAHUN_MIN || tahun > TAHUN_MAX)) {
    context.set.status = 400;
    return { success: false, message: `Tahun harus bilangan bulat ${TAHUN_MIN}-${TAHUN_MAX}` };
  }

  const where: Prisma.DokumenPerencanaanWhereInput = { isActive: true };
  if (jenis) where.jenis = jenis;
  // Tahun cocok dengan tahun dokumen (RKP/berita acara) atau tercakup periode RPJM.
  if (tahunRaw) {
    where.OR = [
      { tahun },
      { tahunMulai: { lte: tahun }, tahunSelesai: { gte: tahun } },
    ];
  }
  if (search) {
    where.AND = [
      {
        OR: [
          { judul: { contains: search, mode: "insensitive" } },
          { nomorPerdes: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.dokumenPerencanaan.findMany({
        where,
        include: { file: FILE_SELECT },
        orderBy: [
          { tahun: { sort: "desc", nulls: "last" } },
          { tahunMulai: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dokumenPerencanaan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil dokumen perencanaan",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di dokumenPerencanaanFindMany:", e);
    return { success: false, message: "Gagal mengambil dokumen perencanaan" };
  }
}

export default dokumenPerencanaanFindMany;
