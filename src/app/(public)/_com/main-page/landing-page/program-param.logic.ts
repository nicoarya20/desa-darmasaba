/** Nama query param beranda yang membuka overlay detail Program Inovasi (`/?program={id}`). */
export const PROGRAM_PARAM = "program";

/** Alamat beranda dengan overlay program terbuka; dipakai hero, cari global, Jenna, dan redirect rute lama. */
export function programOverlayHref(id: string | number): string {
  return `/?${PROGRAM_PARAM}=${encodeURIComponent(String(id))}`;
}

/** Id program dari query beranda; kosong/spasi saja → null (overlay tertutup). */
export function readProgramParam(params: { get(name: string): string | null } | null | undefined): string | null {
  const value = params?.get(PROGRAM_PARAM)?.trim();
  return value ? value : null;
}

type ClickLike = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

/** Klik kiri biasa tanpa modifier → buka overlay di tempat; selain itu biarkan browser (tab baru, unduh, dst.). */
export function isPlainLeftClick(event: ClickLike): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}
