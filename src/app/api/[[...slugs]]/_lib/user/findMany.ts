import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { buildUserWhere, type RoleGroup } from "./user_where";

export default async function userFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  // "admin" | "warga" | "" (kosong = semua, kompatibel pemanggil lama seperti menu-access)
  const roleGroup = ((context.query.roleGroup as string) || "") as RoleGroup;
  const skip = (page - 1) * limit;

  const where = buildUserWhere(roleGroup, search);

  try {
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil user dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data user",
    };
  }
}
