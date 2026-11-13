export const hasDirtySection = (dirty: Readonly<Partial<Record<string, boolean>>>): boolean =>
  Object.values(dirty).some(Boolean);

type ClickLike = Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>;

/** Klik yang dibuka browser di tab/jendela baru: halaman ini tidak ditinggalkan. */
export const isNewTabClick = (e: ClickLike): boolean =>
  e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

/** Pindah ke path lain me-unmount form halaman ini, jadi draf hilang. Klik path yang sama tidak. */
export const shouldConfirmLeave = (pathname: string, href: string, hasUnsaved: boolean): boolean =>
  hasUnsaved && href !== pathname;
