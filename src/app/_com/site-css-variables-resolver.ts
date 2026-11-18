import { v8CssVariablesResolver, type CSSVariablesResolver } from "@mantine/core";

/**
 * Palet gelap bawaan Mantine (dark-0..9, #c9c9c9…#141414) dipetakan ke token palet A (--c-*,
 * theme-tokens.css). Komponen Mantine memakai shade ini langsung di mode gelap (latar input &
 * popover = dark-6, garis = dark-4, body = dark-7, teks = dark-0, dimmed = dark-2, placeholder =
 * dark-3), jadi cukup petakan shade-nya; urutan terang → gelap tetap seperti bawaan.
 * Hanya bagian `dark` resolver yang diubah: tema terang (dan admin, selalu terang) identik.
 */
export const DARK_SHADE_TOKENS = {
  "--mantine-color-dark-0": "var(--c-ink)", // teks
  "--mantine-color-dark-1": "var(--c-ink-2)",
  "--mantine-color-dark-2": "var(--c-muted)", // dimmed
  "--mantine-color-dark-3": "var(--c-subtle)", // placeholder, chevron
  "--mantine-color-dark-4": "var(--c-line-strong)", // garis input/popover/divider
  "--mantine-color-dark-5": "var(--c-tile-alt)", // hover, input varian filled
  "--mantine-color-dark-6": "var(--c-tile)", // latar input, popover, menu
  "--mantine-color-dark-7": "var(--c-bg-alt)", // --mantine-color-body: modal, paper
  "--mantine-color-dark-8": "var(--c-bg)",
  "--mantine-color-dark-9": "var(--c-bg)",
} as const;

/** v8CssVariablesResolver (warna varian v8 selama migrasi Mantine 9) + shade gelap palet A. */
export const siteCssVariablesResolver: CSSVariablesResolver = (theme) => {
  const base = v8CssVariablesResolver(theme);
  return { ...base, dark: { ...base.dark, ...DARK_SHADE_TOKENS } };
};
