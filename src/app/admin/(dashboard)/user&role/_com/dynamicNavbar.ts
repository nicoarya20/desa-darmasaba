// src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts
import { devBar, navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';

// ✅ Helper: normalisasi ID menu agar konsisten
const normalizeMenuId = (id: string): string => {
  return id.trim().toLowerCase();
};

export function getNavbar({
  roleId,
  menuIds,
}: {
  roleId: number;
  menuIds?: string[] | null;
}) {
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