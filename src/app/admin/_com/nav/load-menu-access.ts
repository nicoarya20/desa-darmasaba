// Ambil Menu Access user untuk sidebar admin (client).
type MenuAccessPayload = { success?: boolean; menuIds?: unknown }

/** menuIds tersimpan milik user (null bila belum diatur/gagal) — dipakai getNavbar. */
export async function loadMenuAccess(userId: string): Promise<string[] | null> {
  const res = await fetch(`/api/admin/user-menu-access?userId=${encodeURIComponent(userId)}`, {
    credentials: "include",
  })
  const data = (await res.json()) as MenuAccessPayload
  return data.success && Array.isArray(data.menuIds)
    ? data.menuIds.filter((id): id is string => typeof id === "string")
    : null
}
