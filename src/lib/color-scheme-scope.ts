/**
 * Cakupan tema gelap: hanya situs publik (route group `(public)`) yang boleh gelap.
 * Admin, konsol developer, dan halaman akun punya tampilan/dark mode sendiri
 * (`src/state/darkModeStore.ts`), jadi selalu dipaksa terang walau localStorage
 * `mantine-color-scheme-value` = "dark" (atribut `data-mantine-color-scheme` di <html> berlaku global).
 */

/** Awalan rute di luar situs publik (folder teratas `src/app` selain `(public)`). Dijaga test. */
export const LIGHT_ONLY_PATH_PREFIXES = [
  "/admin",
  "/dev",
  "/auth",
  "/login",
  "/registrasi",
  "/validasi",
  "/waiting-room",
  "/profile",
  "/percobaan",
  "/terms-of-service",
] as const;

/** True bila `pathname` milik area yang selalu terang (cocok per segmen: `/profil` bukan `/profile`). */
export function isLightOnlyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return LIGHT_ONLY_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Skema bawaan situs publik bila pengunjung belum pernah memilih: ikuti OS (prefers-color-scheme).
 * Satu sumber untuk ColorSchemeScript, MantineProvider akar, dan pemulihan admin → publik.
 */
export const DEFAULT_COLOR_SCHEME = "auto" as const;

/** Warna `<meta name="theme-color">` (bilah status/tab browser) per skema; terang = nilai lama. */
export const THEME_COLOR = { light: "#ffffff", dark: "#000000" } as const;

/**
 * `viewport.themeColor` (layout akar): dua <meta theme-color> ber-media agar warna bilah benar sebelum
 * hidrasi untuk skema "auto". Setelah hidrasi SiteMantineProvider menimpa isi keduanya sesuai atribut
 * <html> (pilihan tombol tersimpan menang atas OS; admin selalu terang).
 */
export const THEME_COLOR_VIEWPORT: { media: string; color: string }[] = [
  { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
  { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
];

/** Samakan isi semua <meta name="theme-color"> dengan skema atribut <html>; hanya menulis yang beda. */
export function syncThemeColorMeta(doc: Pick<Document, "documentElement" | "querySelectorAll">): void {
  const scheme = doc.documentElement.getAttribute("data-mantine-color-scheme") === "dark" ? "dark" : "light";
  doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    if (meta.getAttribute("content") !== THEME_COLOR[scheme]) meta.setAttribute("content", THEME_COLOR[scheme]);
  });
}

/**
 * Skrip <head> yang dijalankan TEPAT SETELAH ColorSchemeScript: di area selalu-terang, timpa atribut
 * yang baru dipasang dari localStorage supaya admin tidak berkedip gelap sebelum React hidrasi.
 */
export const COLOR_SCHEME_SCOPE_HEAD_SCRIPT = `(function(){var p=location.pathname;var l=${JSON.stringify(
  LIGHT_ONLY_PATH_PREFIXES,
)};for(var i=0;i<l.length;i++){if(p===l[i]||p.indexOf(l[i]+"/")===0){document.documentElement.setAttribute("data-mantine-color-scheme","light");return;}}})();`;
