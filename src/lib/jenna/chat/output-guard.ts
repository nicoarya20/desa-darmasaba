// Penjaga jawaban akhir Jenna sebelum dikirim/disimpan: buang sisa pembungkus tool & HTML mentah, hanya
// tautan allowlist yang tetap jadi tautan (path internal polos / kode inline berisi satu path ikut dijadikan
// tautan berlabel judul dari data), dan PII disamarkan kecuali nilainya tercantum di data publik. Judul data
// yang disebut tanpa tautan ikut masuk daftar sumber (teks jawaban tidak diubah).
import type { JennaSource } from "../chat-types";
import { clipText } from "../knowledge/html";
import { isAllowedJennaHref } from "../knowledge/sitemap";
import { maskPii, type PiiKeep } from "../pii";
import { sanitizeResponse } from "../tools/executor";

export const MAX_SOURCES = 8;

const HTML_COMMENT = /<!--[\s\S]*?(?:-->|$)/g;
const HTML_TAG = /<\/?[A-Za-z][^<>]*>/g;
const MD_LINK = /(!?)\[([^\]\n]*)\]\(\s*<?([^)\s>]*)>?(?:\s+"[^"\n]*")?\s*\)/g;
const BARE_URL = /https?:\/\/[^\s<>()[\]"'`]+/gi;
// Kode inline | URL mentah | path internal polos. Path harus diawali huruf/angka dan tidak menempel ke
// karakter kata/angka/URL sebelumnya, sehingga "11/14", "1/2", "dan/atau" tidak dianggap path.
const PLAIN_TOKEN =
  /`[^`\n]*`|https?:\/\/[^\s<>()[\]"'`]+|(?<![\w/.:@~%&=+)\]-])\/[A-Za-z0-9][\w.~%/-]*(?:[?#][\w.~%/=&-]*)?/gi;
const TRAILING_PUNCT = /[.,;:!?]+$/;
// Isi kode inline yang seluruhnya satu path/URL (bentuk sama dengan PLAIN_TOKEN) boleh dijadikan tautan.
const LINKABLE_CODE = /^(?:https?:\/\/[^\s<>()[\]"'`]+|\/[A-Za-z0-9][\w.~%/-]*(?:[?#][\w.~%/=&-]*)?)$/i;
// Penanda internal untuk tautan yang sudah lolos; dibuang dulu dari input agar tidak bisa dipalsukan.
const SLOT = "\u0000";
const SLOT_REF = /\u0000(\d+)\u0000/g;

export interface GuardResult {
  text: string;
  sources: JennaSource[];
}

export interface GuardOptions {
  /** Path internal polos yang diizinkan dijadikan tautan markdown. Default true; false untuk giliran suara. */
  linkifyPaths?: boolean;
  /** `normalizeHref(href)` → judul dari data giliran ini (lihat `collectLinkTitles`); dibaca saat dipakai. */
  titles?: ReadonlyMap<string, string>;
}

const DATA_LINK = /\[([^\]\n]+)\]\(((?:\/|https?:\/\/)[^)\s]*)\)/g;
// Item hasil tool di-serialisasi `JSON.stringify({title, url, text})` — urutan kunci tetap.
const TOOL_ITEM = /"title":("(?:[^"\\]|\\.)*"),"url":("(?:[^"\\]|\\.)*")/g;
const TITLE_MAX = 120;

/** Kunci pencocokan href: `%xx` di-decode, tanpa query/hash, tanpa garis miring di akhir. */
export function normalizeHref(href: string): string {
  const path = href.trim().split(/[?#]/, 1)[0];
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // `%` tak valid: biarkan apa adanya.
  }
  return decoded.length > 1 ? decoded.replace(/\/+$/, "") || "/" : decoded;
}

/** Judul aman dipakai sebagai label tautan markdown. */
function linkLabel(text: string): string {
  return clipText(text.replace(/\[/g, "(").replace(/\]/g, ")").replace(/\s+/g, " ").trim(), TITLE_MAX);
}

/**
 * Peta href → judul dari teks data (snapshot: `[judul](/path)`; hasil tool: item `{title, url}`).
 * Judul pertama yang ditemukan untuk satu href menang.
 */
export function collectLinkTitles(texts: readonly string[], into: Map<string, string> = new Map()): Map<string, string> {
  const add = (title: string, href: string) => {
    const key = normalizeHref(href);
    const label = linkLabel(title);
    if (label && normalizeHref(label) !== key && !into.has(key)) into.set(key, label);
  };
  for (const text of texts) {
    for (const [, title, href] of text.matchAll(DATA_LINK)) add(title, href);
    for (const [, title, url] of text.matchAll(TOOL_ITEM)) {
      try {
        add(JSON.parse(title) as string, JSON.parse(url) as string);
      } catch {
        // Item terpotong batas ukuran hasil tool: lewati.
      }
    }
  }
  return into;
}

/**
 * Judul dari data (PII-nya sudah tepercaya, tidak disamarkan); bila tak ada, judul href terpanjang yang
 * menjadi prefiks (mis. menu induk "Pengumuman"), lalu path ter-decode.
 */
function titleFor(url: string, titles: ReadonlyMap<string, string>): string {
  const key = normalizeHref(url);
  const exact = titles.get(key);
  if (exact) return exact;
  let best: [string, string] | undefined;
  for (const entry of titles) {
    const [href] = entry;
    if (href !== "/" && key.startsWith(`${href}/`) && href.length > (best?.[0].length ?? 0)) best = entry;
  }
  return best?.[1] ?? linkLabel(key);
}

/**
 * `trustedPii` = nilai `kind:normalized` (lihat `collectPiiValues`) dari snapshot & hasil tool giliran ini;
 * nilai di luar itu disamarkan. Kosong = semua PII disamarkan.
 */
export function guardOutput(
  text: string,
  routes: ReadonlySet<string>,
  trustedPii: ReadonlySet<string> = new Set(),
  { linkifyPaths = true, titles = new Map() }: GuardOptions = {},
): GuardResult {
  const keep: PiiKeep = (kind, value) => trustedPii.has(`${kind}:${value}`);
  const sources: JennaSource[] = [];
  const addSource = (title: string, url: string) => {
    const key = normalizeHref(url);
    if (sources.length < MAX_SOURCES && !sources.some((s) => normalizeHref(s.url) === key)) sources.push({ title, url });
  };

  const bareUrls = (input: string) =>
    input.replace(BARE_URL, (match) => {
      const url = match.replace(TRAILING_PUNCT, "");
      const tail = match.slice(url.length);
      if (!isAllowedJennaHref(url, routes)) return tail;
      addSource(titleFor(url, titles), url);
      return url + tail;
    });

  const kept: string[] = [];
  let out = sanitizeResponse(text.split(SLOT).join(""))
    .replace(HTML_COMMENT, "")
    .replace(HTML_TAG, "");

  out = out.replace(MD_LINK, (_match, _bang: string, rawLabel: string, url: string) => {
    const allowed = !!url && isAllowedJennaHref(url, routes);
    // Label kosong / sama dengan url-nya diganti judul dari data (URL di label tidak dijadikan sumber).
    const bare = !rawLabel.trim() || (allowed && normalizeHref(rawLabel) === normalizeHref(url));
    const label = bare && allowed ? titleFor(url, titles) : maskPii(bareUrls(rawLabel), keep).trim();
    if (!allowed) return label;
    addSource(label, url);
    kept.push(`[${label}](${url})`);
    return `${SLOT}${kept.length - 1}${SLOT}`;
  });

  const linkTo = (href: string) => {
    const label = titleFor(href, titles);
    addSource(label, href);
    kept.push(`[${label}](${href})`);
    return `${SLOT}${kept.length - 1}${SLOT}`;
  };

  out = out.replace(PLAIN_TOKEN, (match) => {
    if (match.startsWith("`")) {
      const code = match.slice(1, -1).trim();
      const linkable = linkifyPaths && LINKABLE_CODE.test(code) && isAllowedJennaHref(code, routes);
      return linkable ? linkTo(code) : bareUrls(match);
    }
    if (/^https?:/i.test(match)) return bareUrls(match);
    const path = match.replace(TRAILING_PUNCT, "");
    if (!linkifyPaths || !isAllowedJennaHref(path, routes)) return match;
    return linkTo(path) + match.slice(path.length);
  });

  out = maskPii(out, keep)
    .replace(SLOT_REF, (_m, index: string) => kept[Number(index)] ?? "")
    .trim();
  for (const href of mentionedTitleHrefs(out, titles, routes)) addSource(titles.get(href) ?? href, encodeURI(href));
  return { text: out, sources };
}

const MENTION_MIN_CHARS = 15;
const TITLE_ELLIPSIS = /(?:…|\.{3})$/;
const WORD_CHAR = /[\p{L}\p{N}]/u;

function normalizeMention(text: string): string {
  return text.toLowerCase().replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Href (kunci peta `titles`) yang judulnya disebut utuh di jawaban, urut kemunculan pertama. Judul pendek /
 * satu kata diabaikan; sebutan yang berada di dalam sebutan judul lain yang lebih panjang tidak dihitung.
 */
function mentionedTitleHrefs(text: string, titles: ReadonlyMap<string, string>, routes: ReadonlySet<string>): string[] {
  if (titles.size === 0) return [];
  const haystack = normalizeMention(text);
  const candidates: { href: string; needle: string; clipped: boolean }[] = [];
  for (const [href, title] of titles) {
    const clipped = TITLE_ELLIPSIS.test(title.trim());
    const needle = normalizeMention(title.trim().replace(TITLE_ELLIPSIS, ""));
    if (needle.length < MENTION_MIN_CHARS || !needle.includes(" ") || !haystack.includes(needle)) continue;
    if (isAllowedJennaHref(href, routes)) candidates.push({ href, needle, clipped });
  }
  candidates.sort((a, b) => b.needle.length - a.needle.length);

  const covered: [number, number][] = [];
  const found: { href: string; at: number }[] = [];
  for (const { href, needle, clipped } of candidates) {
    const spans: [number, number][] = [];
    for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + 1)) {
      const end = at + needle.length;
      if (WORD_CHAR.test(haystack[at - 1] ?? "") || (!clipped && WORD_CHAR.test(haystack[end] ?? ""))) continue;
      if (!covered.some(([s, e]) => s <= at && end <= e)) spans.push([at, end]);
    }
    if (spans.length === 0) continue;
    covered.push(...spans);
    found.push({ href, at: spans[0][0] });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.href);
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

export interface DeltaGuardOptions extends GuardOptions {
  routes: ReadonlySet<string>;
  /** Dibaca tiap flush — boleh bertambah selama giliran (hasil tool). */
  trustedPii: ReadonlySet<string>;
  emit: (text: string) => void;
}

/**
 * Delta stream dijaga per potongan (sampai batas baris/kalimat) dengan `guardOutput`, agar PII/tautan
 * terlarang tidak sempat tampil. Ekor tanpa batas sengaja tidak pernah di-flush: `done.text` menggantikannya.
 */
export function createDeltaGuard({ routes, trustedPii, emit, linkifyPaths, titles }: DeltaGuardOptions): { push(delta: string): void } {
  let buffer = "";
  const flush = (cut: number) => {
    const chunk = buffer.slice(0, cut);
    buffer = buffer.slice(cut);
    const lead = LEADING_WS.exec(chunk)?.[0] ?? "";
    const rest = chunk.slice(lead.length);
    const trail = TRAILING_WS.exec(rest)?.[0] ?? "";
    const out = lead + guardOutput(rest.slice(0, rest.length - trail.length), routes, trustedPii, { linkifyPaths, titles }).text + trail;
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
