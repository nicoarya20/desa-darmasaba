// Logika murni Menu Access sidebar admin (tanpa React/fetch) supaya bisa di-test.
// menuIds (tabel UserMenuAccess) boleh berisi ID section (= semua submenu-nya,
// kompatibel data lama) dan/atau ID submenu (slug `<section>.<submenu>`).
import type { NavItem } from "./domains"

/** Normalisasi ID menu (trim + lowercase) agar data lama yang beda kapitalisasi tetap cocok. */
export const normalizeMenuId = (id: string): string => id.trim().toLowerCase()

/**
 * Section yang hanya untuk role 0/1 (User & Role → canManageMenuAccess,
 * Pengaturan → canManageMenuVisibility). Tidak bisa diberikan lewat Menu Access;
 * dibuang dari sidebar role lain walau tersimpan di DB.
 */
export const RESTRICTED_SECTION_IDS: readonly string[] = ["User & Role", "Pengaturan"]

const RESTRICTED = new Set(RESTRICTED_SECTION_IDS.map(normalizeMenuId))

/** True bila section tidak boleh diberikan lewat Menu Access. */
export function isRestrictedSection(sectionId: string): boolean {
  return RESTRICTED.has(normalizeMenuId(sectionId))
}

/** Buang section khusus role 0/1 dari daftar nav. */
export function withoutRestrictedSections(nav: readonly NavItem[]): NavItem[] {
  return nav.filter((section) => !isRestrictedSection(section.id))
}

/**
 * Saring nav sesuai menuIds: ID section → section utuh; ID submenu → section tampil
 * dengan anak yang diizinkan saja. Section tanpa satu pun anak diizinkan dibuang.
 */
export function filterNavByMenuIds(nav: readonly NavItem[], menuIds: readonly string[]): NavItem[] {
  const allowed = new Set(menuIds.map(normalizeMenuId))
  return nav.flatMap((section) => {
    if (allowed.has(normalizeMenuId(section.id))) return [section]
    const children = (section.children ?? []).filter((c) => allowed.has(normalizeMenuId(c.id)))
    return children.length > 0 ? [{ ...section, children }] : []
  })
}

const segmentsOf = (path: string): string[] => path.split(/[?#]/)[0].split("/").filter(Boolean)

/** True bila pathname sama dengan prefix atau berada di bawahnya — dicocokkan per segmen. */
export function isUnderPath(pathname: string, prefix: string): boolean {
  const base = segmentsOf(prefix)
  if (base.length === 0) return false
  const target = segmentsOf(pathname)
  return base.length <= target.length && base.every((seg, i) => seg === target[i])
}

/** Semua prefix route yang dicakup nav (basePath submenu, atau basePath/path section tanpa anak). */
function scopesOf(nav: readonly NavItem[]): string[] {
  return nav.flatMap((section) =>
    section.children
      ? section.children.map((c) => c.basePath)
      : [section.basePath ?? section.path].filter(Boolean),
  )
}

/** True bila pathname dicakup salah satu menu di nav. */
export function isPathAllowed(pathname: string, nav: readonly NavItem[]): boolean {
  return scopesOf(nav).some((scope) => isUnderPath(pathname, scope))
}

/** Path menu pertama di nav (untuk redirect), null bila nav kosong. */
export function firstAllowedPath(nav: readonly NavItem[]): string | null {
  for (const section of nav) {
    const path = section.children?.[0]?.path ?? section.path
    if (path) return path
  }
  return null
}

/**
 * Gabungkan beberapa nav hasil saring (mis. akses per user/role + menu Publik) mengikuti
 * urutan `order`: section tampil bila ada di salah satu bagian, anaknya = gabungan anak.
 */
export function unionNavs(order: readonly NavItem[], parts: readonly (readonly NavItem[])[]): NavItem[] {
  return order.flatMap((section) => {
    const matches = parts.flatMap((nav) => nav.filter((s) => s.id === section.id))
    if (matches.length === 0) return []
    if (!section.children || matches.some((s) => !s.children)) return [section]
    const childIds = new Set(matches.flatMap((s) => (s.children ?? []).map((c) => c.id)))
    return [{ ...section, children: section.children.filter((c) => childIds.has(c.id)) }]
  })
}
