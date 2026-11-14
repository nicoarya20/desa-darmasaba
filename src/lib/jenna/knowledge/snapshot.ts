import { unstable_cache } from "next/cache";
import { MENU_VISIBILITY_TAG, type MenuVisibilityOverrides } from "@/app/(public)/_com/menu-visibility.logic";
import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import { clipText } from "./html";
import { findSourceRows } from "./query";
import {
  JENNA_KNOWLEDGE_REVALIDATE_SECONDS,
  JENNA_KNOWLEDGE_TAG,
  buildPublicRoutes,
  isSourceVisible,
  resolveSourceHref,
  visibleSiteMap,
  type SiteMapEntry,
} from "./sitemap";
import {
  KNOWLEDGE_SOURCES,
  formatKnowledgeValue,
  type KnowledgeRow,
  type KnowledgeSource,
  type KnowledgeTier,
} from "./sources";
import { renderStaticGuide } from "./static-guide";

/** ≈ 25K token (±3,6 char/token untuk teks Indonesia). */
export const SNAPSHOT_MAX_CHARS = 90_000;
export const SNAPSHOT_TRUNCATED_MARK =
  "[… data dipotong karena batas ukuran — gunakan tool cari_konten / detail_konten untuk data lainnya]";

export type SnapshotSourceRows = { source: KnowledgeSource; rows: KnowledgeRow[] };

export type RenderSnapshotInput = {
  sources: readonly SnapshotSourceRows[];
  siteMap: readonly SiteMapEntry[];
  guide: string;
  routes: ReadonlySet<string>;
  generatedAt: Date;
  maxChars?: number;
};

const TIER_TITLES: Record<KnowledgeTier, string> = {
  A: "Profil & Pemerintahan",
  B: "Layanan & Kontak Resmi",
  C: "Konten Terbaru (judul; isi lengkap via tool detail_konten)",
  D: "Data Angka",
};
// Urutan = prioritas saat dipotong: yang di belakang paling dulu hilang.
const TIER_ORDER: readonly KnowledgeTier[] = ["A", "B", "D", "C"];

const GENERATED_FMT = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Makassar",
  dateStyle: "long",
  timeStyle: "short",
});

function cell(value: string, max: number): string {
  return clipText(value.replace(/\|/g, "/").replace(/\s+/g, " ").trim(), max) || "-";
}

function tableLines({ source, rows }: SnapshotSourceRows, routes: ReadonlySet<string>): string[] {
  const base = resolveSourceHref(source, undefined, routes);
  const hrefs = rows.map((row) => resolveSourceHref(source, row, routes));
  const withLink = hrefs.some((href) => href !== base);
  const labels = source.fields.map(([label]) => label);
  const header = withLink ? [...labels, "Tautan"] : labels;
  return [
    `### ${source.label} (halaman: ${base})`,
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "---").join("|")}|`,
    ...rows.map((row, index) => {
      const cells = source.fields.map(([, value]) => cell(formatKnowledgeValue(value(row)), source.cellMax));
      return `| ${(withLink ? [...cells, hrefs[index]] : cells).join(" | ")} |`;
    }),
    "",
  ];
}

function listLines({ source, rows }: SnapshotSourceRows, routes: ReadonlySet<string>): string[] {
  return [
    `### ${source.label} (halaman: ${resolveSourceHref(source, undefined, routes)})`,
    ...rows.map((row) => {
      const date = source.dateField ? formatKnowledgeValue(row[source.dateField]) : "";
      const title = cell(source.title(row), 160);
      return `- ${date ? `${date} — ` : ""}${title} — ${resolveSourceHref(source, row, routes)}`;
    }),
    "",
  ];
}

function siteMapLines(siteMap: readonly SiteMapEntry[]): string[] {
  return [
    "## Peta Situs (halaman publik yang terlihat)",
    ...siteMap.map((entry) => `- ${entry.group ? `${entry.group} › ` : ""}[${entry.name}](${entry.href})`),
    "",
  ];
}

/** Snapshot Markdown murni (tanpa IO); dipotong di batas baris bila melebihi `maxChars`. */
export function renderKnowledgeSnapshot(input: RenderSnapshotInput): string {
  const maxChars = input.maxChars ?? SNAPSHOT_MAX_CHARS;
  const lines: string[] = [
    "# Pengetahuan Website Desa Darmasaba",
    `Data per ${GENERATED_FMT.format(input.generatedAt)} WITA.`,
    "",
    input.guide,
    "",
    ...siteMapLines(input.siteMap),
  ];
  for (const tier of TIER_ORDER) {
    const group = input.sources.filter(({ source, rows }) => source.tier === tier && rows.length > 0);
    if (group.length === 0) continue;
    lines.push(`## ${TIER_TITLES[tier]}`, "");
    for (const entry of group) lines.push(...(tier === "C" ? listLines(entry, input.routes) : tableLines(entry, input.routes)));
  }

  const full = lines.join("\n").trimEnd();
  if (full.length <= maxChars) return full;

  const budget = maxChars - SNAPSHOT_TRUNCATED_MARK.length - 1;
  let size = 0;
  const kept: string[] = [];
  for (const line of lines) {
    if (size + line.length + 1 > budget) break;
    kept.push(line);
    size += line.length + 1;
  }
  return `${kept.join("\n").trimEnd()}\n${SNAPSHOT_TRUNCATED_MARK}`.slice(0, maxChars);
}

export type SnapshotBuildOptions = { overrides?: MenuVisibilityOverrides; now?: Date };

/** Muat bahan snapshot dari DB: sumber yang menunya tersembunyi dibuang seluruhnya (tidak di-query). */
export async function loadKnowledgeSnapshotInput(opts: SnapshotBuildOptions = {}): Promise<RenderSnapshotInput> {
  const overrides = opts.overrides ?? (await getMenuVisibilityOverrides());
  const internalRoutes = new Set(buildPublicRoutes(overrides, []));
  const visible = KNOWLEDGE_SOURCES.filter((source) => isSourceVisible(source, internalRoutes));
  const sources = await Promise.all(visible.map(async (source) => ({ source, rows: await findSourceRows(source) })));
  const socialUrls = sources
    .filter(({ source }) => source.key === "media_sosial")
    .flatMap(({ rows }) => rows.map((row) => String(row.iconUrl)));
  const routes = new Set(buildPublicRoutes(overrides, socialUrls));
  return {
    sources,
    siteMap: visibleSiteMap(overrides),
    guide: renderStaticGuide(routes),
    routes,
    generatedAt: opts.now ?? new Date(),
  };
}

/** Bangun snapshot dari DB: sumber yang menunya tersembunyi dibuang seluruhnya. */
export async function buildKnowledgeSnapshot(opts: SnapshotBuildOptions = {}): Promise<string> {
  return renderKnowledgeSnapshot(await loadKnowledgeSnapshotInput(opts));
}

export const getKnowledgeSnapshot = unstable_cache(() => buildKnowledgeSnapshot(), ["jenna-knowledge-snapshot"], {
  tags: [JENNA_KNOWLEDGE_TAG, MENU_VISIBILITY_TAG],
  revalidate: JENNA_KNOWLEDGE_REVALIDATE_SECONDS,
});
