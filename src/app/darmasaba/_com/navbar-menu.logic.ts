import { MenuItem } from "../../../../types/menu-item";

/** roleId yang boleh melihat tombol "Kembali ke Admin" (semua role akun admin). */
export const ADMIN_ROLE_IDS: readonly number[] = [0, 1, 2, 3, 4];

/** Cek apakah `pathname` berada di bawah `href` (persis atau sub-path, bukan sekadar prefix string). */
export function isPathActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menu utama aktif bila href-nya atau salah satu href anaknya cocok dengan path. */
export function isMenuActive(item: MenuItem, pathname: string): boolean {
  if (isPathActive(pathname, item.href)) return true;
  return item.children?.some((child) => isPathActive(pathname, child.href)) ?? false;
}

/** Benar bila user login dengan role admin. */
export function isAdminRole(roleId: number | null | undefined): boolean {
  return roleId != null && ADMIN_ROLE_IDS.includes(roleId);
}

/**
 * Satu-satunya filter visibilitas menu publik: buang item `hidden` (di semua level) dan
 * menu utama yang jadi tanpa link (semua submenu tersembunyi, tidak punya href sendiri).
 * Dipakai navbar desktop/flyout/mobile dan sumber default pencarian menu.
 */
export function visibleMenu(menus: readonly MenuItem[]): MenuItem[] {
  return menus.flatMap((item): MenuItem[] => {
    if (item.hidden) return [];
    if (!item.children) return [item];
    const children = visibleMenu(item.children);
    if (children.length === 0 && !item.href) return [];
    return [{ ...item, children }];
  });
}
