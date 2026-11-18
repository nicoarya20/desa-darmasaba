/** Label tombol tema navbar (juga tooltip); yang tampil ditentukan CSS sesuai skema aktif. */
export const THEME_LABEL_TO_DARK = "Aktifkan tema gelap";
export const THEME_LABEL_TO_LIGHT = "Aktifkan tema terang";

/**
 * Skema berikutnya saat tombol ditekan, dari nilai atribut `data-mantine-color-scheme` di <html>.
 * Atribut selalu hasil resolusi ("auto" sudah jadi "light"/"dark" sesuai OS), jadi klik pertama saat
 * OS gelap → "light". Pilihan klik tersimpan eksplisit dan menang atas OS sesudahnya.
 */
export function nextColorScheme(current: string | null | undefined): "light" | "dark" {
  return current === "dark" ? "light" : "dark";
}
