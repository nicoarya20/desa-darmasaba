import { preferredScrollBehavior } from '@/app/(public)/(pages)/pemerintahan/profil/_com/profil.scroll';

/** Tinggi navbar tetap + jarak napas: judul daftar di atas garis ini dianggap sudah terlewati. */
const LIST_SCROLL_OFFSET = 80;

/** Jarak gulir agar judul daftar (posisi `top` relatif viewport) tampil di bawah navbar; `null` bila sudah terlihat. */
export function listScrollDelta(top: number, offset = LIST_SCROLL_OFFSET): number | null {
  return top < offset ? top - offset : null;
}

/**
 * Setelah ganti halaman daftar: gulir ke daftar hanya bila awalnya sudah tergulir lewat (paginasi bawah). `targetId` =
 * judul daftar (`h2`, yang dituju `section` pembungkusnya; judul `srOnly` tak punya posisi tampak) atau wadah daftar.
 */
export function scrollToListTitle(targetId: string): void {
  const el = document.getElementById(targetId);
  const target = el && /^H[1-6]$/.test(el.tagName) ? (el.closest('section') ?? el) : el;
  if (!target) return;
  const delta = listScrollDelta(target.getBoundingClientRect().top);
  if (delta !== null) window.scrollBy({ top: delta, behavior: preferredScrollBehavior() });
}
