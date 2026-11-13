// Panggilan API halaman Menu Access + tree menu yang bisa diberikan.
import { navBar } from '@/app/admin/_com/list_PageAdmin'
import { withoutRestrictedSections } from '@/app/admin/_com/nav/menu-access.logic'

// User & Role dan Pengaturan khusus role 0/1 (otomatis di sidebar mereka), jadi tidak
// bisa diberikan lewat Menu Access.
export const MENU_TREE = withoutRestrictedSections(navBar)

/** Pesan error yang bisa ditampilkan dari nilai catch apa pun. */
export const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error))

async function requestJson(url: string, init?: RequestInit): Promise<{ menuIds?: string[] }> {
  const res = await fetch(url, init)
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

const postJson = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

/** menuIds tersimpan milik seorang user. */
export async function fetchUserMenuIds(userId: string): Promise<string[]> {
  const data = await requestJson(`/api/admin/user-menu-access?userId=${encodeURIComponent(userId)}`)
  return data.menuIds ?? []
}

/** Ganti seluruh menuIds seorang user. */
export async function saveUserMenuIds(userId: string, menuIds: string[]): Promise<void> {
  await requestJson('/api/admin/user-menu-access', postJson({ userId, menuIds }))
}
