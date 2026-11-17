/** Label tombol tema navbar (juga tooltip); yang tampil ditentukan CSS sesuai skema aktif. */
export const THEME_LABEL_TO_DARK = "Aktifkan tema gelap";
export const THEME_LABEL_TO_LIGHT = "Aktifkan tema terang";

/** Skema berikutnya saat tombol ditekan, dari nilai atribut `data-mantine-color-scheme` di <html>. */
export function nextColorScheme(current: string | null | undefined): "light" | "dark" {
  return current === "dark" ? "light" : "dark";
}

/**
 * Tombol tema hanya dirender di development (QA di localhost:3000), tidak di build produksi:
 * keputusan user 2026-11-17, menu lain belum digelapkan sehingga pengunjung yang menyalakan tema
 * gelap akan melihat halaman rusak. plan-dark-theme Fase 4: aktifkan untuk publik.
 */
export function isThemeToggleVisible(nodeEnv: string | undefined): boolean {
  return nodeEnv === "development";
}

export const THEME_TOGGLE_VISIBLE = isThemeToggleVisible(process.env.NODE_ENV);
