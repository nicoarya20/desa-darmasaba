// Pembangun where-clause Prisma untuk daftar user. Fungsi murni (tanpa I/O)
// agar bisa diunit-test. Dipakai findMany.ts.

// Kelompok role: admin (dashboard) vs warga publik (login Google).
export const ADMIN_ROLE_IDS = ["0", "1", "2", "3", "4"];
export const WARGA_ROLE_IDS = ["5"];

export type RoleGroup = "admin" | "warga" | "";

export type UserWhere = {
  roleId?: { in: string[] };
  OR?: Array<
    | { username: { contains: string; mode: "insensitive" } }
    | { email: { contains: string; mode: "insensitive" } }
  >;
};

/**
 * Bangun where-clause untuk prisma.user.findMany/count.
 * @param roleGroup "admin" → role 0-4, "warga" → role 5, "" → semua role.
 * @param search    filter by username / email (case-insensitive). Kosong = tanpa filter.
 */
export function buildUserWhere(roleGroup: RoleGroup, search: string): UserWhere {
  const where: UserWhere = {};

  if (roleGroup === "admin") {
    where.roleId = { in: ADMIN_ROLE_IDS };
  } else if (roleGroup === "warga") {
    where.roleId = { in: WARGA_ROLE_IDS };
  }

  const term = search.trim();
  if (term) {
    where.OR = [
      { username: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  return where;
}
