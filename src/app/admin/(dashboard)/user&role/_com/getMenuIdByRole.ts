// src/app/admin/_com/getMenuIdsByRoleId.ts
import { navBar, role1, role2, role3 } from '@/app/admin/_com/list_PageAdmin';

/**
 * Mengembalikan daftar ID menu (string[]) berdasarkan roleId
 */
export function getMenuIdsByRoleId(roleId: string | number): string[] {
  const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;

  switch (id) {
    case 0:
      // Asumsikan devBar ada dan punya struktur sama
      return []; // atau sesuaikan jika ada devBar
    case 1:
      return navBar.map(section => section.id);
    case 2:
      return role1.map(section => section.id);
    case 3:
      return role2.map(section => section.id);
    case 4:
      return role3.map(section => section.id);
    default:
      return [];
  }
}