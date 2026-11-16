import { z } from "zod";
import { findSourceRowById } from "../knowledge/query";
import { isSourceVisible } from "../knowledge/sitemap";
import { KNOWLEDGE_DOMAINS, sourcesOfDomain } from "../knowledge/sources";
import { parseToolArgs, toToolItem } from "./common";
import type { JennaTool } from "./types";

const DETAIL_TEXT_MAX = 3000;

export const detailKontenArgs = z
  .object({
    domain: z.enum(KNOWLEDGE_DOMAINS),
    id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, "id harus 1-40 karakter alfanumerik/-/_"),
  })
  .strict();

export const detailKontenTool: JennaTool = {
  spec: {
    name: "detail_konten",
    description:
      "Ambil isi lengkap satu konten publik berdasarkan domain dan id (id terlihat di akhir tautan hasil cari_konten atau daftar konten terbaru).",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", enum: [...KNOWLEDGE_DOMAINS], description: "Domain konten." },
        id: { type: "string", maxLength: 40, description: "Id konten." },
      },
      required: ["domain", "id"],
      additionalProperties: false,
    },
  },
  async run(args, ctx) {
    const parsed = parseToolArgs(detailKontenArgs, args);
    if (!parsed.ok) return parsed.output;
    const { domain, id } = parsed.data;
    const sources = sourcesOfDomain(domain).filter((source) => isSourceVisible(source, ctx.routes));
    for (const source of sources) {
      if (ctx.signal.aborted) break;
      const row = await findSourceRowById(source, id);
      if (row) return { ok: true, items: [toToolItem(source, row, ctx.routes, DETAIL_TEXT_MAX)] };
    }
    return { ok: false, message: "Konten tidak ditemukan." };
  },
};
