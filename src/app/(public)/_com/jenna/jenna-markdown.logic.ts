// Parser markdown kecil untuk jawaban Jenna: hasilnya pohon data yang dirender React (tidak pernah HTML mentah).

export type JennaInline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: JennaInline[] }
  | { type: "em"; children: JennaInline[] }
  | { type: "link"; href: string; children: JennaInline[] };

export type JennaBlock =
  | { type: "paragraph"; lines: JennaInline[][] }
  | { type: "heading"; children: JennaInline[] }
  | { type: "list"; ordered: boolean; start: number; items: JennaInline[][] };

export type JennaHrefKind = "internal" | "external" | null;

/** Path internal `/…` (bukan `//host`) atau URL `https:`; selain itu link dirender sebagai teks biasa. */
export function classifyHref(href: string): JennaHrefKind {
  if (/[\u0000-\u001f\u007f\\\s]/.test(href)) return null;
  if (/^\/(?!\/)/.test(href)) return "internal";
  if (/^https:\/\/[^/]/i.test(href)) {
    try {
      return new URL(href).protocol === "https:" ? "external" : null;
    } catch {
      return null; // URL tidak valid → tampil sebagai teks
    }
  }
  return null;
}

const LINK_RE = /^\[([^\]\n]+)\]\(([^()\s]+)\)/;

function pushText(out: JennaInline[], value: string) {
  const last = out[out.length - 1];
  if (last?.type === "text") last.value += value;
  else out.push({ type: "text", value });
}

export function parseInline(src: string, allowLinks = true): JennaInline[] {
  const out: JennaInline[] = [];
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    if (rest[0] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) {
        out.push({ type: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    } else if (rest.startsWith("**")) {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        out.push({ type: "strong", children: parseInline(src.slice(i + 2, end), allowLinks) });
        i = end + 2;
        continue;
      }
    } else if (rest[0] === "*" && rest[1] && rest[1] !== " " && rest[1] !== "*") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1 && src[end - 1] !== " ") {
        out.push({ type: "em", children: parseInline(src.slice(i + 1, end), allowLinks) });
        i = end + 1;
        continue;
      }
    } else if (rest[0] === "[" && allowLinks) {
      const m = LINK_RE.exec(rest);
      if (m) {
        out.push({ type: "link", href: m[2], children: parseInline(m[1], false) });
        i += m[0].length;
        continue;
      }
    }
    pushText(out, src[i]);
    i += 1;
  }
  return out;
}

const UL_RE = /^\s*[-*•]\s+(.*)$/;
const OL_RE = /^\s*(\d{1,4})[.)]\s+(.*)$/;
const HEADING_RE = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;

export function parseJennaMarkdown(text: string): JennaBlock[] {
  const blocks: JennaBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; start: number; items: string[] } | null = null;

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph.map((l) => parseInline(l)) });
    if (list) blocks.push({ type: "list", ordered: list.ordered, start: list.start, items: list.items.map((l) => parseInline(l)) });
    paragraph = [];
    list = null;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = HEADING_RE.exec(line);
    const ul = UL_RE.exec(line);
    const item = ul ?? OL_RE.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: "heading", children: parseInline(heading[1]) });
    } else if (item) {
      const ordered = !ul;
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, start: ordered ? Number(item[1]) : 1, items: [] };
      }
      list.items.push(ordered ? item[2] : item[1]);
    } else if (list && /^\s+/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      if (list) flush();
      paragraph.push(line.trim());
    }
  }
  flush();
  return blocks;
}
