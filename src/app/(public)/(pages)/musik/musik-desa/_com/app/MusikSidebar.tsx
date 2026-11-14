'use client';

import { IconMusic } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { activeMusikNav } from './musik-nav.logic';
import { MUSIK_APP_TEXT as T, MUSIK_NAV_ITEMS } from './musik-nav.meta';
import s from './musik-app.module.css';

/** Sidebar kiri desktop (>1068px): merek, menu Musik/Jelajahi/Playlist, dan slot daftar playlist admin. */
export function MusikSidebar() {
  const active = activeMusikNav(usePathname());
  return (
    <aside className={s.sidebar}>
      <p className={s.brand}>
        <IconMusic size={22} stroke={1.8} aria-hidden />
        {T.brand}
      </p>
      <nav aria-label={T.navLabel}>
        <ul className={s.navList}>
          {MUSIK_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
            <li key={key}>
              <Link href={href} className={s.navItem} aria-current={key === active ? 'page' : undefined}>
                <Icon size={22} stroke={1.8} aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className={s.playlistSlot} aria-labelledby="musik-playlist-heading">
        <h2 id="musik-playlist-heading" className={s.playlistHeading}>
          {T.playlistHeading}
        </h2>
        <p className={s.playlistEmpty}>{T.playlistEmpty}</p>
      </section>
    </aside>
  );
}

/** Pil tab menu (≤1068px) yang menggantikan sidebar, menempel di bawah navbar dan bisa digulir. */
export function MusikNavPills() {
  const current = activeMusikNav(usePathname());
  return (
    <nav className={s.pills} aria-label={T.navLabel}>
      {MUSIK_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
        <Link key={key} href={href} className={s.pill} aria-current={key === current ? 'page' : undefined}>
          <Icon size={18} stroke={1.8} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
