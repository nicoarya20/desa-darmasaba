import { effectiveMenuVisibility, type MenuVisibilityOverrides } from "./menu-visibility.logic";
import { flattenMenu } from "./searchMenu";

/** Path beranda; selalu baris pertama sitemap. */
export const HOME_PATH = "/";

/**
 * Route lama yang page.tsx-nya hanya `redirect()` 307 tapi masih ditaut pencarian global (lihat komentar di
 * page-nya). Sitemap hanya boleh berisi URL 200; tujuannya (`/inovasi/layanan-online-desa`,
 * `/pemerintahan/berita/semua`) sudah masuk sebagai submenu. Dijaga test: tiap path di sitemap tak memanggil redirect.
 */
export const REDIRECT_ONLY_PATHS: ReadonlySet<string> = new Set([
  "/inovasi/layanan-online-desa/pengaduan-masyarakat",
  "/inovasi/layanan-online-desa/informasi-desa",
]);

/**
 * Path halaman statis untuk sitemap.xml: beranda lalu submenu terlihat + halaman tambahan pencarian (sumber sama
 * dengan Peta Informasi), urut config. Submenu tersembunyi (default + override DB) tidak ikut; bagian `?…`/`#…`
 * dibuang lalu di-dedupe (section Dashboard Kependudukan = satu halaman), route redirect-saja dibuang. Detail dari DB
 * belum dimasukkan.
 */
export function sitemapPaths(overrides: MenuVisibilityOverrides): string[] {
  const paths = flattenMenu(effectiveMenuVisibility(overrides).searchMenus)
    .map((item) => item.href.split(/[?#]/, 1)[0])
    .filter((path) => path.startsWith("/") && !path.startsWith("//") && !REDIRECT_ONLY_PATHS.has(path));
  return [...new Set([HOME_PATH, ...paths])];
}
