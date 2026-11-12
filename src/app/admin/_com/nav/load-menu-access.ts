// Ambil data Menu Access untuk sidebar admin (client): menu per user + menu Publik.
type MenuAccessPayload = { success?: boolean; menuIds?: unknown }

const idsFrom = (data: MenuAccessPayload): string[] | null =>
  data.success && Array.isArray(data.menuIds) ? data.menuIds.filter((id): id is string => typeof id === "string") : null

async function fetchIds(url: string): Promise<string[] | null> {
  const res = await fetch(url, { credentials: "include" })
  return idsFrom((await res.json()) as MenuAccessPayload)
}

/**
 * Menu per user + menu Publik untuk getNavbar. Gagal memuat menu Publik tidak memblokir
 * login: sidebar tetap tampil dari akses per user/role (null = tidak ada menu Publik).
 */
export async function loadMenuAccess(userId: string): Promise<{ menuIds: string[] | null; publicMenuIds: string[] | null }> {
  const [menuIds, publicMenuIds] = await Promise.all([
    fetchIds(`/api/admin/user-menu-access?userId=${encodeURIComponent(userId)}`),
    fetchIds("/api/admin/public-menu-access").catch((error: unknown) => {
      console.error("Gagal memuat menu publik:", error)
      return null
    }),
  ])
  return { menuIds, publicMenuIds }
}
