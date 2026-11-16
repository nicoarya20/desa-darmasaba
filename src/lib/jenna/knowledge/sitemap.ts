import { unstable_cache } from "next/cache";
import { BERITA_BASE_HREF, BERITA_LIST_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";
import {
  MENU_VISIBILITY_TAG,
  effectiveMenuVisibility,
  isPathHidden,
  type MenuVisibilityOverrides,
} from "@/app/(public)/_com/menu-visibility.logic";
import { KEGIATAN_BASE_HREF } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan.meta";
import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import type { MenuItem } from "../../../../types/menu-item";
import { findSourceRows } from "./query";
import { KNOWLEDGE_SOURCE_BY_KEY, type KnowledgeRow, type KnowledgeSource } from "./sources";

export const JENNA_KNOWLEDGE_TAG = "jenna-knowledge";
export const JENNA_KNOWLEDGE_REVALIDATE_SECONDS = 1800;

export type SiteMapEntry = { group: string; name: string; href: string };

// Halaman detail yang URL-nya bukan turunan href submenu (submenu-nya `/semua`), mengikuti visibilitas submenu itu.
// `null` = tidak punya submenu → selalu terlihat.
const DETAIL_BASES: readonly { base: string; gate: string | null }[] = [
  { base: BERITA_BASE_HREF, gate: BERITA_LIST_HREF },
  { base: KEGIATAN_BASE_HREF, gate: `${KEGIATAN_BASE_HREF}/semua` },
];

function flatten(menus: readonly MenuItem[], group = ""): SiteMapEntry[] {
  return menus.flatMap((item) => {
    const own = item.href ? [{ group, name: item.name, href: item.href }] : [];
    return [...own, ...flatten(item.children ?? [], group || item.name)];
  });
}

/** Halaman publik terlihat (navbar + halaman tambahan pencarian) setelah override visibilitas, tanpa duplikat. */
export function visibleSiteMap(overrides: MenuVisibilityOverrides): SiteMapEntry[] {
  const seen = new Set<string>();
  return flatten(effectiveMenuVisibility(overrides).searchMenus).filter((entry) => {
    if (seen.has(entry.href)) return false;
    seen.add(entry.href);
    return true;
  });
}

/** Himpunan href yang boleh dikutip Jenna: beranda, halaman terlihat, basis detail yang gate-nya terlihat, URL media sosial resmi. */
export function buildPublicRoutes(overrides: MenuVisibilityOverrides, socialUrls: readonly string[]): string[] {
  const { hiddenHrefs } = effectiveMenuVisibility(overrides);
  const pages = visibleSiteMap(overrides).map((entry) => entry.href);
  const visible = new Set(pages);
  const details = DETAIL_BASES.filter(({ gate }) => gate === null || (visible.has(gate) && !isPathHidden(gate, hiddenHrefs)))
    .map(({ base }) => base);
  return [...new Set(["/", ...pages, ...details, ...socialUrls])];
}

const getPublicRouteList = unstable_cache(
  async (): Promise<string[]> => {
    const social = KNOWLEDGE_SOURCE_BY_KEY.get("media_sosial");
    const [overrides, rows] = await Promise.all([
      getMenuVisibilityOverrides(),
      social ? findSourceRows(social) : Promise.resolve([]),
    ]);
    return buildPublicRoutes(overrides, rows.map((row) => String(row.iconUrl)));
  },
  ["jenna-public-routes"],
  { tags: [JENNA_KNOWLEDGE_TAG, MENU_VISIBILITY_TAG], revalidate: JENNA_KNOWLEDGE_REVALIDATE_SECONDS },
);

export async function getVisiblePublicRoutes(): Promise<Set<string>> {
  return new Set(await getPublicRouteList());
}

/**
 * Tautan yang boleh muncul di jawaban/hasil tool.
 * - Path internal: sama dengan, atau di bawah (per segmen), salah satu route terlihat (kecuali "/" yang hanya cocok persis).
 * - URL http(s): hanya yang persis ada di routes (media sosial resmi).
 * - Selain itu ditolak, termasuk tautan file `/api/fileStorage/...` (sengaja tidak dikutip sama sekali).
 */
export function isAllowedJennaHref(href: string, routes: ReadonlySet<string>): boolean {
  const value = href.trim();
  if (/^https?:\/\//i.test(value)) return routes.has(value);
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;
  const path = value.split(/[?#]/, 1)[0];
  if (path.split("/").some((segment) => segment === ".." || segment === ".")) return false;
  if (path.startsWith("/api/")) return false;
  if (routes.has(path)) return true;
  for (const route of routes) {
    if (route !== "/" && route.startsWith("/") && path.startsWith(`${route}/`)) return true;
  }
  return false;
}

/** Sumber registry terlihat bila halaman menunya terlihat. */
export function isSourceVisible(source: KnowledgeSource, routes: ReadonlySet<string>): boolean {
  return isAllowedJennaHref(source.menuHref, routes);
}

/** Tautan satu baris: detail bila diizinkan, kalau tidak halaman menu induknya. */
export function resolveSourceHref(source: KnowledgeSource, row: KnowledgeRow | undefined, routes: ReadonlySet<string>): string {
  const href = source.href(row);
  return isAllowedJennaHref(href, routes) ? href : source.menuHref;
}
