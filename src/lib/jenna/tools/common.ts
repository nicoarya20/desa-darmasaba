import type { z } from "zod";
import { AGENDA_TIME_ZONE } from "@/lib/agenda-desa-waktu";
import { clipText } from "../knowledge/html";
import { resolveSourceHref } from "../knowledge/sitemap";
import type { KnowledgeRow, KnowledgeSource } from "../knowledge/sources";
import type { ToolItem, ToolOutput } from "./types";

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Validasi argumen tool (schema zod `.strict()`); pesan error ringkas untuk LLM, tanpa menggemakan nilai input. */
export function parseToolArgs<T>(
  schema: z.ZodType<T>,
  args: unknown,
): { ok: true; data: T } | { ok: false; output: ToolOutput } {
  const parsed = schema.safeParse(args);
  if (parsed.success) return { ok: true, data: parsed.data };
  const detail = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "argumen"}: ${issue.message}`)
    .join("; ");
  return { ok: false, output: { ok: false, message: `Argumen tidak valid — ${detail}` } };
}

/** `YYYY-MM-DD` valid di kalender (bukan 2026-02-31). */
export function isRealDate(ymd: string): boolean {
  if (!ISO_DATE.test(ymd)) return false;
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** 00:00 WITA tanggal `YYYY-MM-DD` sebagai Date UTC. */
export function witaDayStart(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - WITA_OFFSET_MS);
}

const WITA_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: AGENDA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const WITA_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: AGENDA_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function witaToday(now: Date): string {
  return WITA_DATE.format(now);
}

export function witaTime(now: Date): string {
  return WITA_TIME.format(now);
}

/** Baris registry → item hasil tool (tautan sudah lolos allowlist). */
export function toToolItem(source: KnowledgeSource, row: KnowledgeRow, routes: ReadonlySet<string>, maxText: number): ToolItem {
  return {
    title: clipText(source.title(row), 200),
    url: resolveSourceHref(source, row, routes),
    text: clipText(source.toText(row), maxText),
  };
}
