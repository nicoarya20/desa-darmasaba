'use client'
import type { MouseEvent } from 'react';
import s from './profil.module.css';
import { preferredScrollBehavior } from './profil.scroll';
import { PROFIL_TEXT } from './profil.text';

const T = PROFIL_TEXT.nav;

/** Gulir ke section bertanda `id`; bila belum ada di DOM, tautan `#id` bawaan browser yang bekerja. */
function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
  // Fokus ikut pindah supaya pembaca layar/keyboard melanjutkan dari section tujuan.
  target.focus({ preventScroll: true });
  window.history.replaceState(null, '', `#${id}`);
}

/** Baris tombol di bawah kepala Profil Desa: satu tombol per section, klik menggulir langsung ke section itu. */
export function ProfilNav() {
  return (
    <nav className={s.nav} aria-label={T.label}>
      <ul className={s.navList}>
        {T.items.map((item) => (
          <li key={item.id}>
            <a className={s.navPill} href={`#${item.id}`} onClick={(event) => scrollToSection(event, item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
