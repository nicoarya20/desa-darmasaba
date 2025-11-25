// src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts
import { devBar, navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';

export function getNavbar({
  roleId,
  menuIds,
}: {
  roleId: number;           // pastikan number
  menuIds?: string[] | null; // opsional
}) {
  // Prioritas: menuIds > roleId
  if (menuIds && menuIds.length > 0) {
    return navBar.filter(section => menuIds.includes(section.id));
  }

  // Fallback ke role-based
  if (roleId === 0) return devBar;
  if (roleId === 1) return navBar;
  if (roleId === 2) return role1;
  if (roleId === 3) return role2;
  if (roleId === 4) return role3;
  return [];
}