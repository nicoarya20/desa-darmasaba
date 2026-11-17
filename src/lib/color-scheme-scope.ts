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

/** Warna `<meta name="theme-color">` (bilah status/tab browser) per skema; terang = nilai lama. */
export const THEME_COLOR = { light: "#ffffff", dark: "#000000" } as const;

/**
 * Skrip <head> yang dijalankan TEPAT SETELAH ColorSchemeScript: di area selalu-terang, timpa atribut
 * yang baru dipasang dari localStorage supaya admin tidak berkedip gelap sebelum React hidrasi.
 */
export const COLOR_SCHEME_SCOPE_HEAD_SCRIPT = `(function(){var p=location.pathname;var l=${JSON.stringify(
  LIGHT_ONLY_PATH_PREFIXES,
)};for(var i=0;i<l.length;i++){if(p===l[i]||p.indexOf(l[i]+"/")===0){document.documentElement.setAttribute("data-mantine-color-scheme","light");return;}}})();`;
