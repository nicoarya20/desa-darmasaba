// @vitest-environment node
// PENJAGA: CSS situs publik tidak memakai warna literal yang tidak ikut tema (dark theme Fase 4). Test ini membaca SEMUA
// *.css di src/app/(public). Literal yang tidak tercakup aturan otomatis wajib diganti token/light-dark() atau diberi
// penanda `/* tema-tetap: <alasan> */` (docs/DESIGN.md › "Penjaga warna literal").
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
const DOC =
  'Perbaiki dengan token --c-* (src/app/theme-tokens.css), light-dark(terang, gelap), override @mixin dark, ' +
  'atau penanda `/* tema-tetap: <alasan> */` tepat setelah `;` deklarasi bila warnanya memang sama di dua tema. ' +
  'Lihat docs/DESIGN.md › "Penjaga warna literal".';

/* ---------------------------------------------------------------------------------------------------
 * Pengecualian per file/selektor (MAKS 3, keputusan user 2026-11-18). Literal biasa pakai penanda tema-tetap.
 * --------------------------------------------------------------------------------------------------- */

const EXCEPTIONS = [
  {
    file: '(pages)/keamanan/cctv/_com/cctv-explorer.module.css',
    selector: /^\.(map|marker)\b/,
    reason: 'Pulau terang peta CCTV (final): light-dark() di repo ini transform postcss, jadi alias wajib nilai polos.',
  },
  {
    file: '(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/lokasi.module.css',
    selector: /^\.(mapFill|marker|popup)\b/,
    reason: 'Pulau terang peta Bank Sampah (final): alias nilai polos, sama dengan peta CCTV.',
  },
  {
    file: '_com/splash/gate-splash.module.css',
    selector: null,
    reason: 'Splash Candi Bentar: satu adegan ilustrasi (fajar, air, emas) yang sama di dua tema.',
  },
] as const;

const MAX_EXCEPTIONS = 3;

/* ---------------------------------------------------------------------------------------------------
 * Parser (sengaja kecil; diuji dengan potongan sintetis di bawah)
 * --------------------------------------------------------------------------------------------------- */

type Decl = { prop: string; value: string; valueAt: number; end: number; chain: string[]; line: number };
type Marker = { at: number; line: number; reason: string; wellFormed: boolean };

const lineAt = (src: string, i: number) => src.slice(0, i).split('\n').length;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Komentar diganti spasi (panjang & baris tetap) supaya indeks deklarasi = indeks sumber asli. */
function maskComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Semua deklarasi beserta rantai prelude pembungkusnya (@media, @mixin dark, aturan bersarang). */
function declarations(src: string): Decl[] {
  const css = maskComments(src);
  const out: Decl[] = [];
  const stack: string[] = [];
  let start = 0;
  let paren = 0;
  let quote: string | null = null;
  const flush = (end: number) => {
    const text = css.slice(start, end);
    const colon = text.indexOf(':');
    if (stack.length && colon > 0 && text.trim()) {
      const lead = text.length - text.trimStart().length;
      out.push({
        prop: text.slice(0, colon).trim().toLowerCase(),
        value: text.slice(colon + 1),
        valueAt: start + colon + 1,
        end,
        chain: [...stack],
        line: lineAt(src, start + lead),
      });
    }
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (paren > 0) continue;
    else if (c === '{') {
      stack.push(norm(css.slice(start, i)));
      start = i + 1;
    } else if (c === ';') {
      flush(i);
      start = i + 1;
    } else if (c === '}') {
      flush(i);
      if (!stack.length) throw new Error(`Kurung kurawal CSS tidak seimbang di indeks ${i}`);
      stack.pop();
      start = i + 1;
    }
  }
  if (stack.length) throw new Error('Kurung kurawal CSS tidak tertutup');
  return out;
}

const NAMED =
  'white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|pink|navy|gold|teal|maroon|lime|aqua|fuchsia|olive';
const COLOR = new RegExp(
  `#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\\b|(?<![\\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(|(?<![\\w-])(?:${NAMED})(?![\\w-])`,
  'gi',
);

type Literal = { text: string; fns: string[]; at: number };

/** Literal warna di nilai deklarasi + fungsi pembungkusnya (dalam → luar). Isi url(...) dan string dilewati. */
function literals(value: string): Literal[] {
  const out: Literal[] = [];
  // Lompati isi url() dan string tanpa menggeser indeks.
  const scan = value
    .replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)/gi, (m) => ' '.repeat(m.length))
    .replace(/"[^"]*"|'[^']*'/g, (m) => ' '.repeat(m.length));
  for (const m of scan.matchAll(COLOR)) {
    const i = m.index ?? 0;
    let text = m[0];
    if (text.endsWith('(')) {
      let depth = 1;
      let k = i + text.length;
      for (; k < scan.length && depth; k++) depth += scan[k] === '(' ? 1 : scan[k] === ')' ? -1 : 0;
      text = scan.slice(i, k);
    }
    const fns: string[] = [];
    let depth = 0;
    for (let k = i - 1; k >= 0; k--) {
      if (scan[k] === ')') depth++;
      else if (scan[k] === '(') {
        if (depth) depth--;
        else fns.push((/([\w-]+)$/.exec(scan.slice(0, k)) ?? ['', ''])[1].toLowerCase());
      }
    }
    out.push({ text: norm(text), fns, at: i });
  }
  return out;
}

/** Penanda `/* tema-tetap: alasan *\/` di sumber asli. Komentar lain yang menyebut tema-tetap = salah format. */
function markers(src: string): Marker[] {
  const out: Marker[] = [];
  for (const m of src.matchAll(/\/\*[\s\S]*?\*\//g)) {
    if (!/tema-tetap/.test(m[0])) continue;
    const at = m.index ?? 0;
    const reason = /^\/\*\s*tema-tetap:\s*([\s\S]*?)\s*\*\/$/.exec(m[0])?.[1] ?? '';
    out.push({ at, line: lineAt(src, at), reason, wellFormed: /[a-z0-9]/i.test(reason) });
  }
  return out;
}

const DARK = /@mixin\s+dark\b|data-mantine-color-scheme\s*=\s*['"]?dark|prefers-color-scheme\s*:\s*dark/;
const isDark = (prelude: string) => DARK.test(prelude);
const isBlack = (lit: string) =>
  /^#0{3}(?:[0-9a-f])?$|^#0{6}(?:[0-9a-f]{2})?$/i.test(lit) || /^rgba?\(\s*0[\s,]+0[\s,]+0(?:[\s,/][^)]*)?\)$/i.test(lit);
/** Keluarga properti untuk mencocokkan pasangan terang ↔ override gelap (shorthand ↔ longhand warna). */
const family = (prop: string) =>
  prop.startsWith('--') ? prop : prop.replace(/-color$/, '').replace(/^(border|outline|background)(-.*)?$/, '$1');
const lightKey = (d: Decl) => d.chain.filter((p) => !isDark(p)).join(' > ');

/** Aturan otomatis R1–R5. Mengembalikan nama aturan, atau null bila literal butuh penanda/pengecualian. */
function autoRule(d: Decl, lit: Literal, darkKeys: Set<string>): string | null {
  if (lit.fns.includes('light-dark')) return 'R1 light-dark()';
  if (d.chain.some(isDark)) return 'R2 blok gelap';
  if (darkKeys.has(`${lightKey(d)}|${family(d.prop)}`)) return 'R3 pasangan override gelap';
  if (d.prop.replace(/^-webkit-/, '').startsWith('mask')) return 'R4 mask';
  if (/shadow$/.test(d.prop) || lit.fns.includes('drop-shadow')) return 'R5 bayangan';
  if (isBlack(lit.text) && lit.fns.some((f) => f.endsWith('-gradient'))) return 'R5 scrim hitam di gradien';
  return null;
}

type Finding = { rel: string; line: number; prop: string; literal: string; selector: string };
type Report = { violations: string[]; staleMarkers: string[]; usedExceptions: Set<number> };

/** Pindai satu file: pelanggaran, penanda basi/kosong, dan pengecualian yang terpakai. */
function audit(rel: string, src: string, exceptions: readonly (typeof EXCEPTIONS)[number][] = EXCEPTIONS): Report {
  const decls = declarations(src);
  const darkKeys = new Set(decls.filter((d) => d.chain.some(isDark)).map((d) => `${lightKey(d)}|${family(d.prop)}`));
  const marks = markers(src);
  const usedMarks = new Set<Marker>();
  const usedExceptions = new Set<number>();
  const violations: string[] = [];

  for (const d of decls) {
    const pending: Finding[] = literals(d.value)
      .filter((lit) => !autoRule(d, lit, darkKeys))
      .map((lit) => ({ rel, line: lineAt(src, d.valueAt + lit.at), prop: d.prop, literal: lit.text, selector: d.chain[d.chain.length - 1] ?? '' }));
    // Penanda melekat ke deklarasi bila ia komentar pertama setelah `;` di baris yang sama.
    const nl = src.indexOf('\n', d.end);
    const tail = src.slice(d.end + 1, nl < 0 ? src.length : nl);
    const mark = src[d.end] === ';' ? marks.find((m) => m.at === d.end + 1 + (tail.length - tail.trimStart().length)) : undefined;
    if (mark) {
      if (pending.length) usedMarks.add(mark);
      if (mark.wellFormed) continue;
    }
    if (!pending.length) continue;
    const ex = exceptions.findIndex((e) => e.file === rel && (!e.selector || e.selector.test(d.chain.join(' '))));
    if (ex >= 0) {
      usedExceptions.add(ex);
      continue;
    }
    violations.push(...pending.map((f) => `${f.rel}:${f.line} › ${f.prop}: ${f.literal} (${norm(f.selector)})`));
  }

  const staleMarkers = marks
    .filter((m) => !m.wellFormed || !usedMarks.has(m))
    .map((m) =>
      !m.wellFormed
        ? `${rel}:${m.line} › penanda salah format/alasan kosong (tulis \`/* tema-tetap: <alasan> */\`)`
        : `${rel}:${m.line} › penanda basi: tidak melekat ke deklarasi berwarna literal (hapus, atau taruh tepat setelah \`;\`)`,
    );
  return { violations, staleMarkers, usedExceptions };
}

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
};

/* ---------------------------------------------------------------------------------------------------
 * Parser benar-benar menangkap pelanggaran (sintetis)
 * --------------------------------------------------------------------------------------------------- */

describe('parser penjaga warna (potongan sintetis)', () => {
  const v = (css: string, rel = 'x.module.css') => audit(rel, css, []).violations;

  it('positif: hex, rgb/rgba/hsl, warna bernama, dan literal di @media/aturan bersarang tertangkap dengan baris', () => {
    const css = [
      '.a { color: #fff; }',
      '.b { background: rgba(10, 78, 120, 0.1); border: 1px solid hsl(0 0% 80%); }',
      '@media (max-width: 734px) { .c { color: white; } }',
      '.d { &:hover { outline: 2px solid #0071E3; } }',
      '.e {',
      '  --ink: #1d1d1f;',
      '}',
    ].join('\n');
    expect(v(css)).toEqual([
      'x.module.css:1 › color: #fff (.a)',
      'x.module.css:2 › background: rgba(10, 78, 120, 0.1) (.b)',
      'x.module.css:2 › border: hsl(0 0% 80%) (.b)',
      'x.module.css:3 › color: white (.c)',
      'x.module.css:4 › outline: #0071E3 (&:hover)',
      'x.module.css:6 › --ink: #1d1d1f (.e)',
    ]);
  });

  it('negatif R1–R5: light-dark, blok gelap, pasangan override, mask, bayangan apa pun, scrim hitam di gradien', () => {
    const css = `
      .a { color: light-dark(#1d1d1f, #f5f5f7); --x: light-dark(rgba(0, 0, 0, 0.06), rgb(255 255 255 / 12%)); }
      .b { @mixin dark { color: #f5f5f7; } }
      :global([data-mantine-color-scheme='dark']) .c { background: #000; }
      @media (prefers-color-scheme: dark) { .d { color: #fff; } }
      .e { border: 1px solid #eee; background: #fff; @mixin dark { border-color: var(--c-line); background-color: var(--c-tile); } }
      .f { mask-image: linear-gradient(#000, transparent); -webkit-mask-image: linear-gradient(red, rgba(0,0,0,.2)); }
      .g { box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 0 0 3px #0a4e78; text-shadow: 0 2px 12px rgba(4,31,50,.6); }
      .h { filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.35)); }
      .i { background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgb(0 0 0 / 0) 60%), radial-gradient(#000, #0000); }
      .j { background-image: url("data:image/svg+xml;utf8,<svg fill='%23fff' stroke='#123456'/>"); }
      .k { color: var(--c-ink); white-space: nowrap; animation: gold-pulse 1s; --c-white: 1; font-family: 'Gold Red'; }
      /* .z { color: #fff; } */`;
    expect(v(css)).toEqual([]);
  });

  it('bukan otomatis: color-mix dengan #fff/#000, fallback var(), hitam polos sebagai latar, gradien berwarna', () => {
    const css = [
      '.a { background: color-mix(in srgb, var(--brand) 9%, #fff); }',
      '.b { border-top: 1px solid var(--rule, #d2d2d7); }',
      '.c { background: rgba(0, 0, 0, 0.55); }',
      '.d { background: linear-gradient(#2f6f9c, transparent); }',
      '.e { color: #fff; @mixin dark { background: var(--c-tile); } }',
    ].join('\n');
    expect(v(css)).toEqual([
      'x.module.css:1 › background: #fff (.a)',
      'x.module.css:2 › border-top: #d2d2d7 (.b)',
      'x.module.css:3 › background: rgba(0, 0, 0, 0.55) (.c)',
      'x.module.css:4 › background: #2f6f9c (.d)',
      'x.module.css:5 › color: #fff (.e)',
    ]);
  });

  it('pasangan R3 harus selektor yang sama: override di selektor lain tidak menolong', () => {
    const css = '.a { color: #1d1d1f; }\n.b { @mixin dark { color: var(--c-ink); } }';
    expect(v(css)).toEqual(['x.module.css:1 › color: #1d1d1f (.a)']);
  });

  it('penanda tema-tetap tepat setelah `;` meloloskan deklarasi itu saja, termasuk nilai multi-baris', () => {
    const css = [
      '.a {',
      '  color: #fff; /* tema-tetap: teks di atas foto */',
      '  background: #1d1d1f;',
      '  background-image: linear-gradient(',
      '    #e3a961,',
      '    #ffe2ae',
      '  ); /* tema-tetap: ilustrasi fajar */',
      '}',
    ].join('\n');
    const r = audit('x.module.css', css, []);
    expect(r.violations).toEqual(['x.module.css:3 › background: #1d1d1f (.a)']);
    expect(r.staleMarkers).toEqual([]);
  });

  it('penanda kosong, salah format, basi, atau tidak menempel ke `;` tertangkap', () => {
    const css = [
      '.a { color: #fff; /* tema-tetap: */ }',
      '.b { color: #fff; /* tema-tetap teks putih */ }',
      '.c { color: var(--c-ink); /* tema-tetap: sudah token */ }',
      '.d { color: light-dark(#000, #fff); /* tema-tetap: sudah light-dark */ }',
      '.e {',
      '  /* tema-tetap: di baris sendiri */',
      '  color: #fff;',
      '}',
    ].join('\n');
    const r = audit('x.module.css', css, []);
    expect(r.violations).toEqual([
      'x.module.css:1 › color: #fff (.a)',
      'x.module.css:2 › color: #fff (.b)',
      'x.module.css:7 › color: #fff (.e)',
    ]);
    expect(r.staleMarkers).toEqual([
      'x.module.css:1 › penanda salah format/alasan kosong (tulis `/* tema-tetap: <alasan> */`)',
      'x.module.css:2 › penanda salah format/alasan kosong (tulis `/* tema-tetap: <alasan> */`)',
      'x.module.css:3 › penanda basi: tidak melekat ke deklarasi berwarna literal (hapus, atau taruh tepat setelah `;`)',
      'x.module.css:4 › penanda basi: tidak melekat ke deklarasi berwarna literal (hapus, atau taruh tepat setelah `;`)',
      'x.module.css:6 › penanda basi: tidak melekat ke deklarasi berwarna literal (hapus, atau taruh tepat setelah `;`)',
    ]);
  });

  it('pengecualian berlaku hanya untuk file + selektor-nya', () => {
    const css = '.map { --ink: #1d1d1f; }\n.marker > span { border: 2.5px solid #fff; }\n.mapFill { color: #fff; }\n.list { color: #fff; }';
    const cctv = EXCEPTIONS[0].file;
    expect(audit(cctv, css).violations).toEqual([`${cctv}:3 › color: #fff (.mapFill)`, `${cctv}:4 › color: #fff (.list)`]);
    expect(audit('lain.module.css', css).violations).toHaveLength(4);
    expect(audit(EXCEPTIONS[2].file, css).violations).toEqual([]);
  });

  it('kurung kurawal tidak seimbang = galat, bukan diam-diam lolos', () => {
    expect(() => declarations('.a { color: #fff;')).toThrow(/tidak tertutup/);
  });
});

/* ---------------------------------------------------------------------------------------------------
 * Pindai src/app/(public)
 * --------------------------------------------------------------------------------------------------- */

describe('src/app/(public): tanpa warna literal yang tidak ikut tema', () => {
  const files = walk(PUBLIC_DIR).map((abs) => ({
    rel: path.relative(PUBLIC_DIR, abs).split(path.sep).join('/'),
    src: readFileSync(abs, 'utf8'),
  }));
  const reports = files.map((f) => ({ ...f, report: audit(f.rel, f.src) }));

  it('pindaian benar-benar membaca file (bukan direktori kosong)', () => {
    expect(files.length).toBeGreaterThan(100);
    for (const e of EXCEPTIONS) expect(files.map((f) => f.rel)).toContain(e.file);
  });

  it('setiap literal warna ikut tema (R1–R5), berpenanda tema-tetap, atau tercakup pengecualian', () => {
    const bad = reports.flatMap((r) => r.report.violations);
    expect(bad, `Warna literal tidak ikut tema. ${DOC}\n${bad.join('\n')}`).toEqual([]);
  });

  it('penanda tema-tetap beralasan dan tidak basi', () => {
    const bad = reports.flatMap((r) => r.report.staleMarkers);
    expect(bad, `Penanda tema-tetap bermasalah. ${DOC}\n${bad.join('\n')}`).toEqual([]);
  });

  it(`pengecualian file/selektor maks ${MAX_EXCEPTIONS}, beralasan, dan masih dipakai (bukan butir basi)`, () => {
    expect(EXCEPTIONS.length).toBeLessThanOrEqual(MAX_EXCEPTIONS);
    EXCEPTIONS.forEach((e, i) => {
      expect(e.reason.trim().length, e.file).toBeGreaterThan(10);
      const used = reports.some((r) => r.rel === e.file && r.report.usedExceptions.has(i));
      expect(used, `Pengecualian basi: ${e.file}. Hapus butirnya.`).toBe(true);
    });
  });
});
