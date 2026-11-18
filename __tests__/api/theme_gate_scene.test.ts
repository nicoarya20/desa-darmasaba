// @vitest-environment node
// Seni adegan transisi tema Candi Bentar (theme-gate-scene.module.css), dibaca sebagai teks:
// kontrak token --tt-* lengkap di dua adegan, siang = splash pembuka, malam = gelap kebiruan.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const COM = path.join(ROOT, 'src/app/(public)/_com');
const sceneCss = readFileSync(path.join(COM, 'theme-transition/theme-gate-scene.module.css'), 'utf8');
const splashCss = readFileSync(path.join(COM, 'splash/gate-splash.module.css'), 'utf8');

/** Kontrak token (README prototipe + task MIND/PLAN/task-theme-gate-transition.md). */
const TOKENS = [
  '--tt-sky',
  '--tt-glow',
  '--tt-halo',
  '--tt-pillar',
  '--tt-rim',
  '--tt-rim-opacity',
  '--tt-rim-opacity-enter',
  '--tt-water',
  '--tt-reflection-opacity',
  '--tt-ripple-light',
  '--tt-brand-sub',
  '--tt-brand-name',
  '--tt-brand-shadow',
  '--tt-flash',
  '--tt-moon-opacity',
  '--tt-stars-opacity',
] as const;

const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '');

/** Isi blok `selector { ... }` pertama yang selektornya diawali baris (kurung kurawal seimbang). */
function block(src: string, selector: string): string {
  const css = stripComments(src);
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|\\n)\\s*${esc}\\s*\\{`).exec(css);
  if (!m) throw new Error(`Blok ${selector} tidak ditemukan`);
  const open = m.index + m[0].length;
  let depth = 1;
  let i = open;
  for (; i < css.length && depth; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
  if (depth) throw new Error(`Blok ${selector} tidak tertutup`);
  return css.slice(open, i - 1);
}

/** Deklarasi sebuah blok sebagai peta properti → nilai (pemisah `;` di luar kurung & string). */
function decls(body: string): Map<string, string> {
  const out = new Map<string, string>();
  let start = 0;
  let paren = 0;
  let quote: string | null = null;
  const flush = (end: number) => {
    const text = body.slice(start, end);
    const colon = text.indexOf(':');
    if (colon > 0) out.set(text.slice(0, colon).trim(), text.slice(colon + 1).trim());
  };
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (c === ';' && !paren) {
      flush(i);
      start = i + 1;
    }
  }
  flush(body.length);
  return out;
}

/** Bentuk pembanding: tanpa spasi, huruf kecil, fallback var() dibuang (`var(--horizon, 76%)` → `var(--horizon)`). */
const canon = (v: string) =>
  v
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/var\((--[\w-]+),[^()]*\)/g, 'var($1)');

const day = decls(block(sceneCss, '.scene[data-scene="day"]'));
const night = decls(block(sceneCss, '.scene[data-scene="night"]'));

const splashRoot = decls(block(splashCss, '.root'));
const SPLASH_COLOR_VARS = ['--navy-0', '--navy-1', '--navy-2', '--sky-low', '--gold'];
/** Nilai splash dengan variabel warna .root di-resolve (variabel geometri seperti --horizon dibiarkan). */
const splash = (selector: string, prop: string) => {
  const raw = decls(block(splashCss, selector)).get(prop);
  if (raw === undefined) throw new Error(`${selector} tidak punya ${prop}`);
  return SPLASH_COLOR_VARS.reduce((v, name) => v.split(`var(${name})`).join(splashRoot.get(name) ?? `var(${name})`), raw);
};

type Rgb = { r: number; g: number; b: number };
/** Semua warna literal dalam urutan kemunculan (hex / rgb / rgba). */
function colors(value: string): Rgb[] {
  return [...value.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(([^)]*)\)/gi)].map((m) => {
    if (m[1]) {
      const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1].slice(0, 6);
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    }
    const [r, g, b] = m[2].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b };
  });
}
/** Luminans relatif WCAG (0 hitam … 1 putih). */
const luminance = ({ r, g, b }: Rgb) => {
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const lastColor = (value: string) => {
  const all = colors(value);
  if (!all.length) throw new Error(`Tidak ada warna di ${value}`);
  return all[all.length - 1];
};

describe('theme-gate-scene: kontrak token', () => {
  it.each([...TOKENS])('%s terdefinisi (tidak kosong) di adegan siang dan malam', (token) => {
    expect(day.get(token)?.length, `siang ${token}`).toBeGreaterThan(0);
    expect(night.get(token)?.length, `malam ${token}`).toBeGreaterThan(0);
  });

  it('tidak ada token --tt-* di luar kontrak (tambahan harus disepakati dulu)', () => {
    const extra = [...day.keys(), ...night.keys()].filter((k) => !(TOKENS as readonly string[]).includes(k));
    expect(extra).toEqual([]);
  });

  it('rim saat pilar masuk tidak lebih tipis dari rim saat latar opak', () => {
    for (const s of [day, night]) {
      expect(Number(s.get('--tt-rim-opacity-enter'))).toBeGreaterThanOrEqual(Number(s.get('--tt-rim-opacity')));
    }
  });
});

describe('theme-gate-scene: adegan siang = splash pembuka', () => {
  const cases: [string, string, string][] = [
    ['--tt-sky', '.sky', 'background'],
    ['--tt-glow', '.dawn', 'background'],
    ['--tt-halo', '.halo', 'background'],
    ['--tt-water', '.water', 'background'],
    ['--tt-rim-opacity', '.gateShape', 'stroke-opacity'],
    ['--tt-reflection-opacity', '.reflection', 'opacity'],
    ['--tt-brand-name', '.name', 'color'],
    ['--tt-brand-shadow', '.brand', 'text-shadow'],
    ['--tt-flash', '.flash', 'background'],
  ];
  it.each(cases)('%s = %s { %s }', (token, selector, prop) => {
    expect(canon(day.get(token) ?? '')).toBe(canon(splash(selector, prop)));
  });

  it('pilar & rim = --navy-0 & --gold splash', () => {
    expect(canon(day.get('--tt-pillar') ?? '')).toBe(canon(splashRoot.get('--navy-0') ?? 'x'));
    expect(canon(day.get('--tt-rim') ?? '')).toBe(canon(splashRoot.get('--gold') ?? 'x'));
  });

  it('teks sub brand = putih splash x opacity .sub', () => {
    expect(canon(splash('.brand', 'color'))).toBe('#fff');
    const subOpacity = splash('.sub', 'opacity');
    expect(canon(day.get('--tt-brand-sub') ?? '')).toBe(canon(`rgba(255, 255, 255, ${subOpacity})`));
  });

  it('kilau riak = garis terang riak B splash', () => {
    const ripple = canon(day.get('--tt-ripple-light') ?? '');
    expect(ripple).toBe('rgba(255,244,214,.10)');
    expect(canon(splashCss)).toContain(`stroke='${ripple}'`);
  });

  it('bulan & bintang tidak tampil di siang', () => {
    expect(Number(day.get('--tt-moon-opacity'))).toBe(0);
    expect(Number(day.get('--tt-stars-opacity'))).toBe(0);
  });
});

describe('theme-gate-scene: adegan malam', () => {
  it('cahaya akhir (flash) berakhir gelap dan tak pernah krem/terang', () => {
    const stops = colors(night.get('--tt-flash') ?? '');
    expect(stops.length).toBeGreaterThanOrEqual(2);
    expect(luminance(lastColor(night.get('--tt-flash') ?? ''))).toBeLessThan(0.01);
    for (const c of stops) expect(luminance(c)).toBeLessThan(0.2);
    // Pembanding: flash siang memang berakhir terang, jadi parser tidak lolos kosong.
    expect(luminance(lastColor(day.get('--tt-flash') ?? ''))).toBeGreaterThan(0.8);
  });

  it('cahaya celah = cahaya bulan kebiruan (biru > merah), bukan fajar krem', () => {
    const moonlight = lastColor(night.get('--tt-glow') ?? '');
    expect(moonlight.b).toBeGreaterThan(moonlight.r);
    const dawn = lastColor(day.get('--tt-glow') ?? '');
    expect(dawn.r).toBeGreaterThan(dawn.b);
  });

  it('langit malam lebih gelap dari langit siang di setiap titik', () => {
    const n = colors(night.get('--tt-sky') ?? '');
    const d = colors(day.get('--tt-sky') ?? '');
    expect(n).toHaveLength(d.length);
    n.forEach((c, i) => expect(luminance(c)).toBeLessThan(luminance(d[i])));
  });

  it('bulan & bintang tampil', () => {
    expect(Number(night.get('--tt-moon-opacity'))).toBeGreaterThan(0);
    expect(Number(night.get('--tt-stars-opacity'))).toBeGreaterThan(0);
  });
});

describe('theme-gate-scene: layer seni & batas performa', () => {
  it('seni bulan/bintang di ::before dengan opacity token (elemennya bebas dipudarkan player)', () => {
    expect(decls(block(sceneCss, '.moon::before')).get('opacity')).toBe('var(--tt-moon-opacity, 0)');
    expect(decls(block(sceneCss, '.stars::before')).get('opacity')).toBe('var(--tt-stars-opacity, 0)');
  });

  it('tanpa filter / mix-blend-mode / light-dark() / -webkit- manual (4K @2x, Lightning CSS, postcss)', () => {
    const css = stripComments(sceneCss);
    expect(css).not.toMatch(/(^|[\s;{])filter\s*:/);
    expect(css).not.toMatch(/mix-blend-mode/);
    expect(css).not.toMatch(/light-dark\(/);
    expect(css).not.toMatch(/-webkit-/);
  });
});
