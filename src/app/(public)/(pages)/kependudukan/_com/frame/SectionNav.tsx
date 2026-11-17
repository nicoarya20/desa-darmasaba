'use client';
import { useEffect, useRef, type MouseEvent } from 'react';
import type { NavSection } from './section-nav.logic';
import s from './section-nav.module.css';
import { KEPENDUDUKAN_TEXT as T } from './kependudukan.text';
import { scrollBehavior, useActiveSection } from './use-section-nav';

/**
 * Rel pil sticky di bawah navbar: lompat ke section (gulir halus, hash diganti tanpa menambah riwayat) dan
 * menandai section yang sedang dibaca. Ponsel: rel geser horizontal, pil aktif dijaga terlihat.
 */
export function SectionNav({ sections }: { sections: readonly NavSection[] }) {
  const railRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const active = useActiveSection(sections, railRef);

  useEffect(() => {
    const list = listRef.current;
    const pill = active ? list?.querySelector<HTMLElement>(`[data-anchor="${active}"]`) : null;
    if (!list || !pill) return;
    const outside = pill.offsetLeft < list.scrollLeft || pill.offsetLeft + pill.offsetWidth > list.scrollLeft + list.clientWidth;
    if (outside) list.scrollTo({ left: pill.offsetLeft - list.clientWidth / 2 + pill.offsetWidth / 2, behavior: scrollBehavior() });
  }, [active]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
    const target = document.getElementById(anchor);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    // state riwayat milik router Next dipertahankan; hanya hash yang diganti.
    window.history.replaceState(window.history.state, '', `#${anchor}`);
  };

  return (
    <nav ref={railRef} className={s.rail} aria-label={T.navLabel}>
      <ul ref={listRef} className={s.list}>
        {sections.map(({ anchor, label }) => (
          <li key={anchor}>
            <a
              href={`#${anchor}`}
              data-anchor={anchor}
              className={s.pill}
              aria-current={active === anchor ? 'location' : undefined}
              onClick={(event) => jump(event, anchor)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
