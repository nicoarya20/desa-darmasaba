// Penjaga jawaban akhir Jenna sebelum dikirim/disimpan: buang sisa pembungkus tool & HTML mentah, hanya
// tautan allowlist yang tetap jadi tautan, dan PII disamarkan kecuali nilainya tercantum di data publik.
import type { JennaSource } from "../chat-types";
import { isAllowedJennaHref } from "../knowledge/sitemap";
import { maskPii, type PiiKeep } from "../pii";
import { sanitizeResponse } from "../tools/executor";

export const MAX_SOURCES = 8;

const HTML_COMMENT = /<!--[\s\S]*?(?:-->|$)/g;
const HTML_TAG = /<\/?[A-Za-z][^<>]*>/g;
const MD_LINK = /(!?)\[([^\]\n]*)\]\(\s*<?([^)\s>]*)>?(?:\s+"[^"\n]*")?\s*\)/g;
const BARE_URL = /https?:\/\/[^\s<>()[\]"'`]+/gi;
const TRAILING_PUNCT = /[.,;:!?]+$/;
// Penanda internal untuk tautan yang sudah lolos; dibuang dulu dari input agar tidak bisa dipalsukan.
const SLOT = "\u0000";
const SLOT_REF = /\u0000(\d+)\u0000/g;

export interface GuardResult {
  text: string;
  sources: JennaSource[];
}

/**
 * `trustedPii` = nilai `kind:normalized` (lihat `collectPiiValues`) dari snapshot & hasil tool giliran ini;
 * nilai di luar itu disamarkan. Kosong = semua PII disamarkan.
 */
export function guardOutput(
  text: string,
  routes: ReadonlySet<string>,
  trustedPii: ReadonlySet<string> = new Set(),
): GuardResult {
  const keep: PiiKeep = (kind, value) => trustedPii.has(`${kind}:${value}`);
  const sources: JennaSource[] = [];
  const addSource = (title: string, url: string) => {
    if (sources.length < MAX_SOURCES && !sources.some((s) => s.url === url)) sources.push({ title, url });
  };

  const bareUrls = (input: string) =>
    input.replace(BARE_URL, (match) => {
      const url = match.replace(TRAILING_PUNCT, "");
      const tail = match.slice(url.length);
      if (!isAllowedJennaHref(url, routes)) return tail;
      addSource(url, url);
      return url + tail;
    });

  const kept: string[] = [];
  let out = sanitizeResponse(text.split(SLOT).join(""))
    .replace(HTML_COMMENT, "")
    .replace(HTML_TAG, "");

  out = out.replace(MD_LINK, (_match, _bang: string, rawLabel: string, url: string) => {
    const label = maskPii(bareUrls(rawLabel), keep).trim();
    if (!url || !isAllowedJennaHref(url, routes)) return label;
    addSource(label || url, url);
    kept.push(`[${label || url}](${url})`);
    return `${SLOT}${kept.length - 1}${SLOT}`;
  });

  out = maskPii(bareUrls(out), keep)
    .replace(SLOT_REF, (_m, index: string) => kept[Number(index)] ?? "")
    .trim();
  return { text: out, sources };
}

/** Buffer tanpa batas kalimat/baris yang melewati ukuran ini tetap di-flush (dipotong di spasi aman). */
export const DELTA_FLUSH_CHARS = 800;

const SENTENCE_END = /[.!?] /g;
const LEADING_WS = /^\s*/;
const TRAILING_WS = /\s*$/;

/** Indeks tepat setelah `\n` atau `. `/`! `/`? ` terakhir; 0 = tidak ada batas. */
function lastBoundary(text: string): number {
  let end = text.lastIndexOf("\n") + 1;
  for (const m of text.matchAll(SENTENCE_END)) end = Math.max(end, m.index + 2);
  return end;
}

// Potong setelah spasi yang tidak diikuti digit: nomor telepon/NIK (dipisah spasi) & email/URL tidak pernah terbelah.
// Spasi paling akhir dilewati karena karakter berikutnya belum diketahui.
function forcedCut(text: string): number {
  for (let i = text.length - 2; i >= 0; i--) {
    if (/\s/.test(text[i]) && !/\d/.test(text[i + 1])) return i + 1;
  }
  return text.length;
}

export interface DeltaGuardOptions {
  routes: ReadonlySet<string>;
  /** Dibaca tiap flush — boleh bertambah selama giliran (hasil tool). */
  trustedPii: ReadonlySet<string>;
  emit: (text: string) => void;
}

/**
 * Delta stream dijaga per potongan (sampai batas baris/kalimat) dengan `guardOutput`, agar PII/tautan
 * terlarang tidak sempat tampil. Ekor tanpa batas sengaja tidak pernah di-flush: `done.text` menggantikannya.
 */
export function createDeltaGuard({ routes, trustedPii, emit }: DeltaGuardOptions): { push(delta: string): void } {
  let buffer = "";
  const flush = (cut: number) => {
    const chunk = buffer.slice(0, cut);
    buffer = buffer.slice(cut);
    const lead = LEADING_WS.exec(chunk)?.[0] ?? "";
    const rest = chunk.slice(lead.length);
    const trail = TRAILING_WS.exec(rest)?.[0] ?? "";
    const out = lead + guardOutput(rest.slice(0, rest.length - trail.length), routes, trustedPii).text + trail;
    if (out) emit(out);
  };
  return {
    push(delta) {
      buffer += delta;
      const boundary = lastBoundary(buffer);
      if (boundary > 0) flush(boundary);
      while (buffer.length > DELTA_FLUSH_CHARS) flush(forcedCut(buffer));
    },
  };
}
