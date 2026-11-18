/**
 * Atribut gambar responsif untuk foto yang dilayani `/api/img/<nama>`. Endpoint itu menerima `?size=<lebar>`
 * (resize, tetap webp), jadi satu foto bisa ditawarkan dalam beberapa lebar dan browser memilih yang cukup untuk
 * layar + tata letaknya. Tanpa ini ponsel mengunduh berkas 1920px untuk kartu selebar 300px (juknis lomba 5.4,
 * audit "Improve image delivery").
 */

/** Lebar (px) yang ditawarkan ke browser; berkas asli berlebar 1920px dan tetap menjadi `src` cadangan. */
export const RESPONSIVE_IMAGE_WIDTHS = [480, 768, 1280] as const;

const IMG_API_PREFIX = "/api/img/";
const RESPONSIVE_EXTENSION = /\.(webp|jpe?g|png)$/i;

export type ResponsiveImageProps = { src: string; srcSet?: string; sizes?: string };

/** Lebar valid (bilangan bulat > 0), unik, urut naik. */
function normalizeWidths(widths: readonly number[]): number[] {
  const valid = widths.filter((w) => Number.isInteger(w) && w > 0);
  return [...new Set(valid)].sort((a, b) => a - b);
}

/**
 * `src` + `srcSet` + `sizes` untuk foto `/api/img/<nama>` (webp/jpg/png). `sizes` WAJIB diberikan pemanggil sesuai
 * lebar tampil di tiap breakpoint. URL lain (eksternal, sudah ber-query, svg/gif, kosong) → hanya `src` apa adanya,
 * karena endpoint tidak bisa di-resize atau hasilnya tak terjamin.
 */
export function responsiveImageProps(
  src: string,
  sizes: string,
  widths: readonly number[] = RESPONSIVE_IMAGE_WIDTHS,
): ResponsiveImageProps {
  const resizable =
    src.startsWith(IMG_API_PREFIX) &&
    src.length > IMG_API_PREFIX.length &&
    !/[?#]/.test(src) &&
    RESPONSIVE_EXTENSION.test(src);
  const list = normalizeWidths(widths);
  if (!resizable || list.length === 0) return { src };

  return { src, srcSet: list.map((w) => `${src}?size=${w} ${w}w`).join(", "), sizes };
}
