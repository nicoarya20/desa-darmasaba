// src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts
import { devBar, navBar, pengaturanMenu, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';
import { canManageMenuVisibility } from '@/lib/auth-policy';

// ✅ Helper: normalisasi ID menu agar konsisten
const normalizeMenuId = (id: string): string => {
  return id.trim().toLowerCase();
};

type NavbarInput = { roleId: number; menuIds?: string[] | null };

/** Sidebar admin untuk user: section sesuai Menu Access/role, plus Pengaturan khusus role 0/1. */
export function getNavbar(input: NavbarInput) {
  const sections = sectionsFor(input);
  // Pengaturan (visibilitas menu publik) hanya role 0/1, apa pun isi Menu Access-nya.
  return canManageMenuVisibility(input.roleId) ? [...sections, pengaturanMenu] : sections;
}

function sectionsFor({ roleId, menuIds }: NavbarInput) {
  // ✅ Jika menuIds tersedia, gunakan untuk filter — dengan normalisasi
  if (menuIds && menuIds.length > 0) {
    // Normalisasi semua menuIds dari DB/state
    const normalizedMenuSet = new Set(menuIds.map(id => normalizeMenuId(id)));

    return navBar.filter(section => {
      const normalizedSectionId = normalizeMenuId(section.id);
      return normalizedMenuSet.has(normalizedSectionId);
    });
  }

  // 🔁 Fallback ke role-based navigation
  if (roleId === 0) return devBar;
  if (roleId === 1) return navBar;
  if (roleId === 2) return role1;
  if (roleId === 3) return role2;
  if (roleId === 4) return role3;
  return [];
}