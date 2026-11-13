import { IconGauge, IconRobot, type Icon } from '@tabler/icons-react';

export type DevNavItem = { label: string; href: string; icon: Icon };

export const DEV_NAV: readonly DevNavItem[] = [
  { label: 'Ringkasan Sistem', href: '/dev/ringkasan', icon: IconGauge },
  { label: 'Pengaturan Jenna', href: '/dev/jenna', icon: IconRobot },
];

/** Item aktif untuk path itu sendiri dan sub-path-nya (bukan prefix mentah: /dev/jenna ≠ /dev/jennax). */
export function isDevNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
