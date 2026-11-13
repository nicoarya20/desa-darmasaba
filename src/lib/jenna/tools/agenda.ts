import { z } from "zod";
import { findSourceRows } from "../knowledge/query";
import { isSourceVisible } from "../knowledge/sitemap";
import { KNOWLEDGE_SOURCE_BY_KEY, type KnowledgeRow } from "../knowledge/sources";
import { isRealDate, parseToolArgs, toToolItem, witaDayStart } from "./common";
import type { JennaTool, ToolItem } from "./types";

export const AGENDA_MAX_DAYS = 62;
const AGENDA_MAX_ITEMS = 20;
const ITEM_TEXT_MAX = 400;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isoDate = z.string().refine(isRealDate, "format tanggal YYYY-MM-DD");

export const agendaArgs = z
  .object({ dari: isoDate, sampai: isoDate })
  .strict()
  .refine(({ dari, sampai }) => dari <= sampai, { message: "sampai tidak boleh sebelum dari", path: ["sampai"] })
  .refine(
    ({ dari, sampai }) => (witaDayStart(sampai).getTime() - witaDayStart(dari).getTime()) / MS_PER_DAY < AGENDA_MAX_DAYS,
    { message: `rentang maksimal ${AGENDA_MAX_DAYS} hari`, path: ["sampai"] },
  );

// Event yang dimulai sebelum rentang tapi belum selesai tetap ikut.
function rangeWhere(key: string, gte: Date, lt: Date): Record<string, unknown> {
  if (key === "event_budaya") {
    return { tanggal: { lt }, OR: [{ tanggal: { gte } }, { tanggalSelesai: { gte } }] };
  }
  return { tanggal: { gte, lt } };
}

export const agendaTool: JennaTool = {
  spec: {
    name: "agenda",
    description: `Daftar agenda/event budaya dan kegiatan desa pada rentang tanggal (YYYY-MM-DD, WITA, maksimal ${AGENDA_MAX_DAYS} hari).`,
    parameters: {
      type: "object",
      properties: {
        dari: { type: "string", format: "date", description: "Tanggal awal (YYYY-MM-DD)." },
        sampai: { type: "string", format: "date", description: "Tanggal akhir, inklusif (YYYY-MM-DD)." },
      },
      required: ["dari", "sampai"],
      additionalProperties: false,
    },
  },
  async run(args, ctx) {
    const parsed = parseToolArgs(agendaArgs, args);
    if (!parsed.ok) return parsed.output;
    const gte = witaDayStart(parsed.data.dari);
    const lt = new Date(witaDayStart(parsed.data.sampai).getTime() + MS_PER_DAY);

    const sources = ["event_budaya", "kegiatan_desa"].flatMap((key) => {
      const source = KNOWLEDGE_SOURCE_BY_KEY.get(key);
      return source && isSourceVisible(source, ctx.routes) ? [source] : [];
    });
    if (sources.length === 0) return { ok: false, message: "Agenda desa tidak tersedia di website saat ini." };

    const dated: { at: number; item: ToolItem }[] = [];
    for (const source of sources) {
      if (ctx.signal.aborted) break;
      const rows: KnowledgeRow[] = await findSourceRows(source, { extraWhere: rangeWhere(source.key, gte, lt), take: AGENDA_MAX_ITEMS });
      for (const row of rows) {
        dated.push({ at: new Date(row.tanggal as Date).getTime(), item: toToolItem(source, row, ctx.routes, ITEM_TEXT_MAX) });
      }
    }
    dated.sort((a, b) => a.at - b.at);
    return { ok: true, items: dated.slice(0, AGENDA_MAX_ITEMS).map(({ item }) => item) };
  },
};
