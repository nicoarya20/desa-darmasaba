// src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts
import { devBar, navBar, pengaturanMenu, role1, role2, role3, userRoleMenu } from '@/app/admin/_com/list_PageAdmin';
import { filterNavByMenuIds, unionNavs, withoutRestrictedSections } from '@/app/admin/_com/nav/menu-access.logic';
import { canManageMenuAccess, canManageMenuVisibility } from '@/lib/auth-policy';

type NavbarInput = { roleId: number; menuIds?: string[] | null; publicMenuIds?: string[] | null };

/**
 * Sidebar admin untuk user: section/submenu sesuai Menu Access/role ditambah menu Publik
 * (terbuka untuk semua admin), plus User & Role dan Pengaturan yang khusus role 0/1.
 */
export function getNavbar(input: NavbarInput) {
  // Menu Publik hanya MENAMBAH akses — tidak pernah mengurangi menu per user/role.
  const publicNav = filterNavByMenuIds(navBar, input.publicMenuIds ?? []);
  // User & Role / Pengaturan dibuang dulu (walau tersimpan di DB untuk role 2–4),
  // lalu ditambahkan kembali di akhir hanya untuk role yang berhak — urutan tetap.
  const sections = withoutRestrictedSections(unionNavs(navBar, [sectionsFor(input), publicNav]));
  return [
    ...sections,
    ...(canManageMenuAccess(input.roleId) ? [userRoleMenu] : []),
    ...(canManageMenuVisibility(input.roleId) ? [pengaturanMenu] : []),
  ];
}

function sectionsFor({ roleId, menuIds }: NavbarInput) {
  // menuIds berisi ID section (semua submenu) dan/atau ID submenu.
  if (menuIds && menuIds.length > 0) return filterNavByMenuIds(navBar, menuIds);

  // 🔁 Fallback ke role-based navigation
  if (roleId === 0) return devBar;
  if (roleId === 1) return navBar;
  if (roleId === 2) return role1;
  if (roleId === 3) return role2;
  if (roleId === 4) return role3;
  return [];
}
