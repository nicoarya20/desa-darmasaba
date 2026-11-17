// @vitest-environment node
// PENJAGA: situs publik tidak memakai garis bawah saat hover. Pengganti resminya modul sapuan warna
// `src/app/(public)/_com/link-reveal/` (docs/DESIGN.md › "Modul sapuan warna tautan"). Test ini membaca
// SEMUA *.css dan *.tsx di src/app/(public) supaya pelanggaran baru langsung merah, di domain mana pun.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
const DOC = 'Ganti dengan .trigger + .title/.cta (lihat docs/DESIGN.md › "Modul sapuan warna tautan").';

/* ---------------------------------------------------------------------------------------------------
 * Pengecualian (eksplisit; tambah butir HANYA atas keputusan user, catat juga di DESIGN.md):
 * --------------------------------------------------------------------------------------------------- */

/** CSS: aturan :hover bergaris bawah yang boleh, per file + at-rule pembungkusnya. */
const CSS_EXCEPTIONS = [
  {
    file: '_com/link-reveal/link-reveal.module.css',
    atRule: '@media (forced-colors: active)',
    reason: 'Mode kontras tinggi mematikan gradasi sapuan; garis bawah jadi satu-satunya penanda hover/fokus.',
  },
] as const;

/** TSX: file yang boleh memakai <Anchor> tanpa underline="never". */
const ANCHOR_EXCEPTIONS = [
  {
    match: /^_com\/Footer[^/]*\.tsx$/,
    reason: 'Footer tetap garis bawah hover (keputusan user, blok "Aturan tetap" DESIGN.md).',
  },
  {
    match: /^_com\/jenna\/JennaMarkdown\.tsx$/,
    reason: 'Tautan di teks kaya Jenna bergaris bawah PERMANEN (td="underline", WCAG 1.4.1), bukan hover.',
  },
] as const;

/* ---------------------------------------------------------------------------------------------------
 * Parser (sengaja kecil; diuji dengan potongan sintetis di bawah)
 * --------------------------------------------------------------------------------------------------- */

type CssRule = { selector: string; body: string; parents: string[] };

/** Aturan daun (tanpa blok anak) beserta prelude pembungkusnya (@media, @supports, aturan bersarang). */
function leafRules(source: string): CssRule[] {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: CssRule[] = [];
  const stack: { prelude: string; from: number; hasChild: boolean }[] = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      if (stack.length) stack[stack.length - 1].hasChild = true;
      stack.push({ prelude: css.slice(start, i).trim(), from: i + 1, hasChild: false });
      start = i + 1;
    } else if (ch === '}') {
      const block = stack.pop();
      if (!block) throw new Error(`Kurung kurawal CSS tidak seimbang di indeks ${i}`);
      if (!block.hasChild) out.push({ selector: block.prelude, body: css.slice(block.from, i), parents: stack.map((b) => b.prelude) });
      start = i + 1;
    } else if (ch === ';' && !stack.length) {
      start = i + 1; // @import/@charset di tingkat atas
    }
  }
  if (stack.length) throw new Error('Kurung kurawal CSS tidak tertutup');
  return out;
}

const UNDERLINE_DECL = /text-decoration(?:-line)?\s*:[^;]*\bunderline\b/;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Selektor :hover yang menyalakan underline, kecuali yang tercakup CSS_EXCEPTIONS. */
function cssViolations(rel: string, source: string): string[] {
  return leafRules(source)
    .filter((r) => r.selector.includes(':hover') && UNDERLINE_DECL.test(r.body))
    .filter((r) => !CSS_EXCEPTIONS.some((e) => e.file === rel && r.parents.some((p) => norm(p) === e.atRule)))
    .map((r) => `${rel} › ${norm(r.selector)}`);
}

/** Tag pembuka <Anchor …> lengkap (kurawal & string dilompati, jadi `=>`/`>` di dalam ekspresi aman). */
function anchorTags(source: string): { tag: string; line: number }[] {
  const out: { tag: string; line: number }[] = [];
  const re = /<Anchor(?=[\s>/])/g;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    let i = m.index + '<Anchor'.length;
    let depth = 0;
    let quote: string | null = null;
    for (; i < source.length; i++) {
      const c = source[i];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    out.push({ tag: source.slice(m.index, i + 1), line: source.slice(0, m.index).split('\n').length });
  }
  return out;
}

/** <Anchor> tanpa underline="never", dan prop underline hover/always di mana pun. */
function tsxViolations(rel: string, source: string): string[] {
  if (ANCHOR_EXCEPTIONS.some((e) => e.match.test(rel))) return [];
  const missing = anchorTags(source)
    .filter((t) => !/\sunderline="never"/.test(t.tag))
    .map((t) => `${rel}:${t.line} › <Anchor> tanpa underline="never"`);
  const banned = [...source.matchAll(/\bunderline=(?:"(?:hover|always)"|\{\s*['"](?:hover|always)['"]\s*\})/g)].map(
    (m) => `${rel}:${source.slice(0, m.index).split('\n').length} › ${m[0]}`,
  );
  return [...missing, ...banned];
}

const walk = (dir: string, ext: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
};
const files = (ext: string) =>
  walk(PUBLIC_DIR, ext).map((abs) => ({ rel: path.relative(PUBLIC_DIR, abs).split(path.sep).join('/'), src: readFileSync(abs, 'utf8') }));

/* ---------------------------------------------------------------------------------------------------
 * Parser benar-benar menangkap pelanggaran (sintetis)
 * --------------------------------------------------------------------------------------------------- */

describe('parser penjaga (potongan sintetis)', () => {
  it('CSS positif: :hover + underline tertangkap, termasuk di @media dan text-decoration-line', () => {
    const css = `
      .a:hover { color: red; text-decoration: underline; }
      @media (hover: hover) and (pointer: fine) {
        .b:hover,
        .c:focus-visible { text-decoration: underline dotted; text-underline-offset: 3px; }
      }
      @supports (x: y) { @media (min-width: 1px) { .d:hover { text-decoration-line: underline } } }
      .e { &:hover { text-decoration: underline; } }`;
    expect(cssViolations('x.module.css', css)).toEqual([
      'x.module.css › .a:hover',
      'x.module.css › .b:hover, .c:focus-visible',
      'x.module.css › .d:hover',
      'x.module.css › &:hover',
    ]);
  });

  it('CSS negatif: hover tanpa underline, underline permanen, none, dan komentar tidak tertangkap', () => {
    const css = `
      /* .z:hover { text-decoration: underline; } */
      .a:hover { color: red; text-decoration: none; }
      .content a { text-decoration: underline; }
      .b:hover { text-underline-offset: 3px; }
      @media (hover: hover) { .c:hover { background: #eee; } }`;
    expect(cssViolations('x.module.css', css)).toEqual([]);
  });

  it('pengecualian forced-colors hanya berlaku untuk link-reveal.module.css', () => {
    const css = '@media (forced-colors: active) { .trigger:hover .cta { text-decoration: underline; } }';
    expect(cssViolations('_com/link-reveal/link-reveal.module.css', css)).toEqual([]);
    expect(cssViolations('lain.module.css', css)).toEqual(['lain.module.css › .trigger:hover .cta']);
    const outside = '.trigger:hover .cta { text-decoration: underline; }';
    expect(cssViolations('_com/link-reveal/link-reveal.module.css', outside)).toHaveLength(1);
  });

  it('TSX: <Anchor> tanpa underline="never" dan underline hover/always tertangkap; ekspresi berisi ">" aman', () => {
    const tsx = [
      '<Anchor href="/a">A</Anchor>',
      '<Anchor',
      '  href={x}',
      "  {...(ext && { target: '_blank', onClick: () => a > b })}",
      '  underline="never"',
      '>B</Anchor>',
      '<Anchor underline="hover" href="/c">C</Anchor>',
      "<Anchor underline={'always'} href=\"/d\" />",
      '<AnchorLike href="/e" />',
      '<Text underline="never">bukan Anchor</Text>',
    ].join('\n');
    expect(tsxViolations('x.tsx', tsx)).toEqual([
      'x.tsx:1 › <Anchor> tanpa underline="never"',
      'x.tsx:7 › <Anchor> tanpa underline="never"',
      'x.tsx:8 › <Anchor> tanpa underline="never"',
      'x.tsx:7 › underline="hover"',
      "x.tsx:8 › underline={'always'}",
    ]);
  });

  it('TSX: file pengecualian (Footer*.tsx, JennaMarkdown.tsx) dilewati', () => {
    const tsx = '<Anchor href="/a" td="underline">A</Anchor>';
    expect(tsxViolations('_com/Footer.tsx', tsx)).toEqual([]);
    expect(tsxViolations('_com/FooterKontakDesa.tsx', tsx)).toEqual([]);
    expect(tsxViolations('_com/jenna/JennaMarkdown.tsx', tsx)).toEqual([]);
    expect(tsxViolations('_com/FooterLike/Bukan.tsx', tsx)).toHaveLength(1);
  });
});

/* ---------------------------------------------------------------------------------------------------
 * Pindai src/app/(public)
 * --------------------------------------------------------------------------------------------------- */

describe('src/app/(public): tanpa garis bawah hover', () => {
  const css = files('.css');
  const tsx = files('.tsx');

  it('pindaian benar-benar membaca file (bukan direktori kosong)', () => {
    expect(css.length).toBeGreaterThan(50);
    expect(tsx.length).toBeGreaterThan(100);
    expect(css.map((f) => f.rel)).toContain('_com/link-reveal/link-reveal.module.css');
  });

  it('CSS: tidak ada aturan :hover yang mendeklarasikan text-decoration underline', () => {
    const bad = css.flatMap((f) => cssViolations(f.rel, f.src));
    expect(bad, `Garis bawah hover ditemukan. ${DOC}\n${bad.join('\n')}`).toEqual([]);
  });

  it('TSX: setiap <Anchor> memakai underline="never"; underline="hover"/"always" dilarang', () => {
    const bad = tsx.flatMap((f) => tsxViolations(f.rel, f.src));
    expect(bad, `Anchor Mantine bawaannya underline="hover". ${DOC}\n${bad.join('\n')}`).toEqual([]);
  });

  it('pengecualian masih dipakai (bukan butir basi)', () => {
    const lr = css.find((f) => f.rel === CSS_EXCEPTIONS[0].file)!;
    const forced = leafRules(lr.src).filter(
      (r) => r.selector.includes(':hover') && UNDERLINE_DECL.test(r.body) && r.parents.some((p) => norm(p) === CSS_EXCEPTIONS[0].atRule),
    );
    expect(forced.length).toBeGreaterThan(0);
    for (const e of ANCHOR_EXCEPTIONS) {
      const hits = tsx.filter((f) => e.match.test(f.rel) && anchorTags(f.src).length > 0);
      expect(hits.length, e.reason).toBeGreaterThan(0);
    }
  });
});
