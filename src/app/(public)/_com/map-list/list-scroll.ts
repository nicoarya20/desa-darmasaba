/** Tinggi navbar desktop: peta yang tertutup di bawahnya dianggap belum terlihat. */
const NAVBAR_OFFSET = 64;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Gulir baris `selector` ke tampilan hanya di dalam daftar yang bergulir sendiri (desktop); daftar yang tidak bergulir
 * tidak menggeser halaman. Daftar wajib ber-position relative agar offsetTop baris diukur dari daftar.
 */
export function scrollRowIntoList(list: HTMLElement | null, selector: string) {
  if (!list || list.scrollHeight <= list.clientHeight) return;
  const row = list.querySelector<HTMLElement>(selector);
  if (!row) return;
  const top = row.offsetTop;
  const bottom = top + row.offsetHeight;
  if (top >= list.scrollTop && bottom <= list.scrollTop + list.clientHeight) return;
  list.scrollTo({ top: Math.max(0, top - 8), behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/** Saat peta dan daftar bertumpuk (tablet/ponsel), gulir peta ke tampilan bila sebagian tertutup navbar/layar. */
export function revealMap(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.top >= NAVBAR_OFFSET && rect.bottom <= window.innerHeight) return;
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
