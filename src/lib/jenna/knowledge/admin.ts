// Tampilan read-only pengetahuan Jenna untuk Developer Console (server-only).
import type { JennaKnowledgeResponse } from "../knowledge-types";
import { JENNA_TOOLS } from "../tools";
import { JENNA_KNOWLEDGE_REVALIDATE_SECONDS, resolveSourceHref } from "./sitemap";
import {
  SNAPSHOT_MAX_CHARS,
  SNAPSHOT_TRUNCATED_MARK,
  loadKnowledgeSnapshotInput,
  renderKnowledgeSnapshot,
  type SnapshotBuildOptions,
} from "./snapshot";
import { KNOWLEDGE_SOURCES } from "./sources";

/**
 * Snapshot segar (tanpa cache) dari bahan yang sama dengan chat publik, semua sumber registry
 * (yang menunya tersembunyi tetap tercantum, `visible: false`), dan daftar tool.
 */
export async function buildJennaKnowledge(opts: SnapshotBuildOptions = {}): Promise<JennaKnowledgeResponse> {
  const input = await loadKnowledgeSnapshotInput(opts);
  const text = renderKnowledgeSnapshot(input);
  const loadedRows = new Map(input.sources.map(({ source, rows }) => [source.key, rows.length]));

  return {
    snapshot: {
      text,
      chars: text.length,
      maxChars: SNAPSHOT_MAX_CHARS,
      truncated: text.endsWith(SNAPSHOT_TRUNCATED_MARK),
      revalidateSeconds: JENNA_KNOWLEDGE_REVALIDATE_SECONDS,
      generatedAt: input.generatedAt.toISOString(),
    },
    sources: KNOWLEDGE_SOURCES.map((source) => {
      const rows = loadedRows.get(source.key);
      const visible = rows !== undefined;
      return {
        key: source.key,
        label: source.label,
        domain: source.domain,
        tier: source.tier,
        visible,
        href: resolveSourceHref(source, undefined, input.routes),
        rows: rows ?? 0,
        take: source.take,
        // Sama dengan syarat cari_konten: punya kolom pencarian dan menunya terlihat.
        searchable: visible && source.searchFields.length > 0,
      };
    }),
    tools: JENNA_TOOLS.map(({ spec }) => ({ name: spec.name, description: spec.description })),
  };
}
