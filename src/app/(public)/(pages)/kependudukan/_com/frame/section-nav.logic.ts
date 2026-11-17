import { RINGKASAN_ANCHOR, SECTION_ANCHOR } from './kependudukan.meta';
import { KEPENDUDUKAN_TEXT } from './kependudukan.text';

/** Satu pil rel navigasi: anchor tujuan + label. */
export type NavSection = { anchor: string; label: string };

const T = KEPENDUDUKAN_TEXT.nav;

/** Urutan pil = urutan section di halaman; Agama tidak ada bila submenunya disembunyikan admin. */
export function navSections(agamaHidden: boolean): NavSection[] {
  const all: (NavSection & { agama?: true })[] = [
    { anchor: RINGKASAN_ANCHOR, label: T.ringkasan },
    { anchor: SECTION_ANCHOR.banjar, label: T.banjar },
    { anchor: SECTION_ANCHOR.umur, label: T.umur },
    { anchor: SECTION_ANCHOR.agama, label: T.agama, agama: true },
    { anchor: SECTION_ANCHOR.dinamika, label: T.dinamika },
  ];
  return all.filter((s) => !(agamaHidden && s.agama)).map(({ anchor, label }) => ({ anchor, label }));
}

/** Posisi atas section relatif viewport (px), urut sesuai halaman. */
export type SectionTop = { anchor: string; top: number };

/**
 * Scroll-spy: section aktif = yang terakhir puncaknya sudah melewati garis `line` (bawah rel pil). Sebelum section
 * pertama → section pertama; di dasar halaman → section terakhir (section pendek di bawah tak pernah mencapai garis).
 */
export function pickActiveAnchor(tops: readonly SectionTop[], line: number, atBottom: boolean): string | null {
  if (tops.length === 0) return null;
  if (atBottom) return tops[tops.length - 1].anchor;
  let active = tops[0].anchor;
  for (const { anchor, top } of tops) {
    if (top <= line) active = anchor;
  }
  return active;
}

/** Hash URL (`#banjar`) → anchor bila termasuk section yang tampil; selain itu null. */
export function hashAnchor(hash: string, sections: readonly NavSection[]): string | null {
  const anchor = decodeURIComponent(hash.replace(/^#/, ''));
  return sections.some((s) => s.anchor === anchor) ? anchor : null;
}
