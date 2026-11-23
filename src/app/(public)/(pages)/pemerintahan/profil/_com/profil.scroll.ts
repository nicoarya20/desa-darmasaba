/** Perilaku gulir yang menghormati `prefers-reduced-motion`: instan bila pengguna meminta gerak dikurangi. */
export function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
