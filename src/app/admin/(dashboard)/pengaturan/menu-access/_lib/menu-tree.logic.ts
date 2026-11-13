// State checkbox pohon halaman Menu Access (fungsi murni, tanpa React).
// "Selection" = himpunan ID daun: ID submenu, atau ID section untuk section tanpa anak (Musik).
import type { NavItem } from '@/app/admin/_com/nav/domains'
import { normalizeMenuId } from '@/app/admin/_com/nav/menu-access.logic'

export type Selection = ReadonlySet<string>
export type SectionState = 'checked' | 'indeterminate' | 'unchecked'

/** ID daun sebuah section: semua ID submenu, atau ID section itu sendiri bila tanpa anak. */
export function leafIdsOf(section: NavItem): string[] {
  return section.children && section.children.length > 0
    ? section.children.map((c) => c.id)
    : [section.id]
}

/**
 * Ubah menuIds tersimpan (ID section dan/atau submenu, kapitalisasi lama) menjadi
 * selection daun. ID yang tidak ada di tree (mis. section khusus role 0/1) diabaikan.
 */
export function selectionFromMenuIds(tree: readonly NavItem[], menuIds: readonly string[]): Selection {
  const stored = new Set(menuIds.map(normalizeMenuId))
  const selected = new Set<string>()
  for (const section of tree) {
    const whole = stored.has(normalizeMenuId(section.id))
    for (const id of leafIdsOf(section)) {
      if (whole || stored.has(normalizeMenuId(id))) selected.add(id)
    }
  }
  return selected
}

/** Status checkbox induk: checked bila semua anak, indeterminate bila sebagian. */
export function sectionState(section: NavItem, selected: Selection): SectionState {
  const leaves = leafIdsOf(section)
  const count = leaves.filter((id) => selected.has(id)).length
  if (count === 0) return 'unchecked'
  return count === leaves.length ? 'checked' : 'indeterminate'
}

/** Centang induk: pilih semua anak; bila semua sudah tercentang, lepas semua. */
export function toggleSection(section: NavItem, selected: Selection): Selection {
  const next = new Set(selected)
  const selectAll = sectionState(section, selected) !== 'checked'
  for (const id of leafIdsOf(section)) {
    if (selectAll) next.add(id)
    else next.delete(id)
  }
  return next
}

/** Centang/lepas satu submenu. */
export function toggleLeaf(leafId: string, selected: Selection): Selection {
  const next = new Set(selected)
  if (next.has(leafId)) next.delete(leafId)
  else next.add(leafId)
  return next
}

/**
 * menuIds untuk disimpan: section yang semua anaknya tercentang disimpan sebagai
 * ID section saja (ringkas & kompatibel data lama); sebagian → ID submenu.
 */
export function menuIdsFromSelection(tree: readonly NavItem[], selected: Selection): string[] {
  return tree.flatMap((section) => {
    const state = sectionState(section, selected)
    if (state === 'checked') return [section.id]
    if (state === 'unchecked') return []
    return leafIdsOf(section).filter((id) => selected.has(id))
  })
}
