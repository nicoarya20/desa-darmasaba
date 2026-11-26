import { preferredScrollBehavior } from '@/app/(public)/(pages)/pemerintahan/profil/_com/profil.scroll';

/** Tinggi navbar tetap + jarak napas: judul daftar di atas garis ini dianggap sudah terlewati. */
const LIST_SCROLL_OFFSET = 80;

/** Jarak gulir agar judul daftar (posisi `top` relatif viewport) tampil di bawah navbar; `null` bila sudah terlihat. */
export function listScrollDelta(top: number, offset = LIST_SCROLL_OFFSET): number | null {
  return top < offset ? top - offset : null;
}

/** Setelah ganti halaman daftar: gulir ke judul daftar `titleId` hanya bila judul sudah tergulir lewat (paginasi bawah). */
export function scrollToListTitle(titleId: string): void {
  const title = document.getElementById(titleId);
  const target = title?.closest('section') ?? title;
  if (!target) return;
  const delta = listScrollDelta(target.getBoundingClientRect().top);
  if (delta !== null) window.scrollBy({ top: delta, behavior: preferredScrollBehavior() });
}
