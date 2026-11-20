/** Label UI galeri foto bersama (grid + modal pratinjau). */
export const GALERI_FOTO_TEXT = {
  lihat: (alt: string) => `Lihat ${alt}`,
  lihatFotoKe: (n: number, total: number) => `Lihat foto ${n} dari ${total}`,
  stripLabel: 'Foto lain di galeri',
  sebelumnya: 'Foto sebelumnya',
  berikutnya: 'Foto berikutnya',
} as const
