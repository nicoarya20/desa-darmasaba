import { z } from "zod";
import { findSourceRows } from "../knowledge/query";
import { isSourceVisible } from "../knowledge/sitemap";
import { KNOWLEDGE_DOMAINS, sourcesOfDomain } from "../knowledge/sources";
import { parseToolArgs, toToolItem } from "./common";
import type { JennaTool, ToolItem } from "./types";

export const CARI_KONTEN_MAX_RESULTS = 5;
const ITEM_TEXT_MAX = 600;

export const cariKontenArgs = z
  .object({
    domain: z.enum(KNOWLEDGE_DOMAINS),
    q: z.string().trim().min(2).max(80),
  })
  .strict();

export const cariKontenTool: JennaTool = {
  spec: {
    name: "cari_konten",
    description:
      "Cari konten publik website desa (berita, layanan, kegiatan, UMKM, dll.) berdasarkan kata kunci dalam satu domain. Mengembalikan maksimal 5 hasil berisi judul, tautan, dan ringkasan.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", enum: [...KNOWLEDGE_DOMAINS], description: "Domain konten yang dicari." },
        q: { type: "string", minLength: 2, maxLength: 80, description: "Kata kunci pencarian." },
      },
      required: ["domain", "q"],
      additionalProperties: false,
    },
  },
  async run(args, ctx) {
    const parsed = parseToolArgs(cariKontenArgs, args);
    if (!parsed.ok) return parsed.output;
    const { domain, q } = parsed.data;
    const sources = sourcesOfDomain(domain).filter(
      (source) => source.searchFields.length > 0 && isSourceVisible(source, ctx.routes),
    );
    if (sources.length === 0) return { ok: false, message: "Domain ini tidak tersedia di website saat ini." };

    const items: ToolItem[] = [];
    for (const source of sources) {
      if (items.length >= CARI_KONTEN_MAX_RESULTS || ctx.signal.aborted) break;
      const rows = await findSourceRows(source, {
        extraWhere: { OR: source.searchFields.map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) },
        take: CARI_KONTEN_MAX_RESULTS - items.length,
      });
      items.push(...rows.map((row) => toToolItem(source, row, ctx.routes, ITEM_TEXT_MAX)));
    }
    return { ok: true, items };
  },
};
