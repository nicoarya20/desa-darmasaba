import { useEffect, useRef, useState, type RefObject } from 'react';
import { hashAnchor, pickActiveAnchor, type NavSection } from './section-nav.logic';

/**
 * Jarak (px) di bawah rel pil yang masih dihitung "sedang dibaca". Harus ≥ celah rel → puncak section setelah
 * lompatan (scroll-margin 128 − bawah rel ±104 = 24 desktop, 120 − 104 = 16 ponsel), kalau tidak pil tertinggal satu.
 */
const SPY_TOLERANCE = 40;

/** Gulir halus kecuali pengguna memilih kurangi gerak. */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/** Anchor section yang sedang dibaca (scroll-spy); garis baca = tepi bawah rel pil sticky. */
export function useActiveSection(sections: readonly NavSection[], railRef: RefObject<HTMLElement | null>): string | null {
  const [active, setActive] = useState<string | null>(sections[0]?.anchor ?? null);

  useEffect(() => {
    // Diukur langsung di event scroll (5 getBoundingClientRect, tanpa tulis DOM), bukan lewat requestAnimationFrame:
    // rAF ditahan browser saat tab di latar sehingga penanda bisa macet di section lama.
    const measure = () => {
      const line = (railRef.current?.getBoundingClientRect().bottom ?? 0) + SPY_TOLERANCE;
      const tops = sections.flatMap(({ anchor }) => {
        const el = document.getElementById(anchor);
        return el ? [{ anchor, top: el.getBoundingClientRect().top }] : [];
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActive(pickActiveAnchor(tops, line, atBottom));
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [sections, railRef]);

  return active;
}

/**
 * Buka dengan hash (`/kependudukan/dashboard#umur`, termasuk hasil redirect rute lama): section baru punya tinggi
 * akhir setelah data dimuat, jadi lompatan bawaan browser saat muat bisa meleset. Setelah semua dataset selesai
 * (`settled`), gulir sekali lagi ke section itu tanpa animasi.
 */
export function useHashScroll(sections: readonly NavSection[], settled: boolean): void {
  const done = useRef(false);
  useEffect(() => {
    if (!settled || done.current) return;
    done.current = true;
    const anchor = hashAnchor(window.location.hash, sections);
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
  }, [settled, sections]);
}
