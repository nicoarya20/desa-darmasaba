'use client';

import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { activeMusikNav } from './musik-nav.logic';
import { MUSIK_APP_TEXT as T, MUSIK_NAV_ITEMS } from './musik-nav.meta';
import s from './musik-app.module.css';

/**
 * Sidebar kiri desktop (>1068px): menu Musik/Jelajahi/Playlist dan slot daftar playlist admin.
 * Wadahnya `div`, bukan `aside`: landmark cukup `nav` berlabel di dalamnya. Subjudul "Playlist" berupa teks
 * biasa supaya tidak ada h2 sebelum h1 halaman (sidebar mendahului `main` di DOM).
 */
export function MusikSidebar() {
  const active = activeMusikNav(usePathname());
  return (
    <div className={s.sidebar}>
      <nav aria-label={T.navLabel}>
        <ul className={s.navList}>
          {MUSIK_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
            <li key={key}>
              <Link href={href} className={s.navItem} aria-current={key === active ? 'page' : undefined}>
                <Icon size={20} stroke={1.75} aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={s.playlistSlot}>
        <p className={s.playlistHeading}>{T.playlistHeading}</p>
        <p className={s.playlistEmpty}>{T.playlistEmpty}</p>
      </div>
    </div>
  );
}

/** Pil tab menu (≤1068px) yang menggantikan sidebar, menempel di bawah navbar dan bisa digulir. */
export function MusikNavPills() {
  const current = activeMusikNav(usePathname());
  return (
    <nav className={s.pills} aria-label={T.navLabel}>
      {MUSIK_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
        <Link key={key} href={href} className={s.pill} aria-current={key === current ? 'page' : undefined}>
          <Icon size={18} stroke={1.75} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
