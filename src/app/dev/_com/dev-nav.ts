import {
  IconBook2,
  IconBug,
  IconChartBar,
  IconGauge,
  IconHourglass,
  IconMessages,
  IconMicrophone,
  IconPlugConnected,
  IconRobot,
  IconSettings,
  type Icon,
} from '@tabler/icons-react';

/** `exact`: aktif hanya di path itu sendiri (untuk item yang path-nya induk item lain). */
export type DevNavLink = { label: string; href: string; icon: Icon; exact?: boolean };
export type DevNavGroup = { label: string; basePath: string; icon: Icon; children: readonly DevNavLink[] };
export type DevNavEntry = DevNavLink | DevNavGroup;

export const DEV_NAV: readonly DevNavEntry[] = [
  { label: 'Ringkasan Sistem', href: '/dev/ringkasan', icon: IconGauge },
  {
    label: 'Jenna',
    basePath: '/dev/jenna',
    icon: IconRobot,
    children: [
      { label: 'Umum', href: '/dev/jenna', icon: IconSettings, exact: true },
      { label: 'Provider', href: '/dev/jenna/provider', icon: IconPlugConnected },
      { label: 'Pengetahuan', href: '/dev/jenna/pengetahuan', icon: IconBook2 },
      { label: 'Suara', href: '/dev/jenna/suara', icon: IconMicrophone },
      { label: 'Batas Pemakaian', href: '/dev/jenna/batas', icon: IconHourglass },
      { label: 'Percakapan', href: '/dev/jenna/percakapan', icon: IconMessages },
      { label: 'Penggunaan', href: '/dev/jenna/penggunaan', icon: IconChartBar },
      { label: 'Log Error', href: '/dev/jenna/log-error', icon: IconBug },
    ],
  },
];

export const isDevNavGroup = (entry: DevNavEntry): entry is DevNavGroup => 'children' in entry;

/** Path itu sendiri atau sub-path-nya (bukan prefix mentah: /dev/jenna ≠ /dev/jennax). */
export function isPathWithin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isDevNavActive(pathname: string, item: Pick<DevNavLink, 'href' | 'exact'>): boolean {
  return item.exact ? pathname === item.href : isPathWithin(pathname, item.href);
}

export function isDevNavGroupActive(pathname: string, group: Pick<DevNavGroup, 'basePath'>): boolean {
  return isPathWithin(pathname, group.basePath);
}

/** Buka grup yang memuat `pathname`; grup lain tetap seperti pilihan pengguna. Key = `basePath`. */
export function openActiveGroups(
  open: Readonly<Record<string, boolean>>,
  pathname: string,
  nav: readonly DevNavEntry[] = DEV_NAV,
): Record<string, boolean> {
  const next = { ...open };
  for (const entry of nav) {
    if (isDevNavGroup(entry) && isDevNavGroupActive(pathname, entry)) next[entry.basePath] = true;
  }
  return next;
}
