// @vitest-environment node
// PENJAGA: setiap HTML dari CMS yang dirender lewat dangerouslySetInnerHTML di situs publik memakai penetral
// rich text `rt.root` (src/app/(public)/_com/rich-text/rich-text.module.css). Tanpa itu, warna inline dari editor
// admin atau tempelan Word/Google Docs (mis. teks hitam, latar putih) muncul apa adanya di tema gelap. Test ini
// membaca SEMUA *.tsx di src/app/(public) supaya pemakaian baru tanpa penetral langsung merah, di domain mana pun.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
const DOC = [
  'Pasang rt.root di elemen dangerouslySetInnerHTML itu sendiri (bukan di wadah induk):',
  "  import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';",
  '  <div className={`${d.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html }} />',
  'Lihat docs/DESIGN.md › "Penetral rich text CMS".',
].join('\n');

/* ---------------------------------------------------------------------------------------------------
 * Aturan pengecualian: berdasarkan TAG, bukan daftar file. <script>/<style> berisi kode milik kita
 * (JSON-LD, skrip head), bukan HTML CMS. Saat ini 0 pemakaian di (public); disiapkan untuk JSON-LD SEO.
 * Jangan tambah daftar pengecualian per file tanpa keputusan user (catat juga di DESIGN.md).
 * --------------------------------------------------------------------------------------------------- */
const NON_CMS_TAGS = new Set(['script', 'style']);

/* ---------------------------------------------------------------------------------------------------
 * Parser (sengaja kecil; diuji dengan potongan sintetis di bawah)
 * --------------------------------------------------------------------------------------------------- */

type JsxTag = { name: string; tag: string; line: number };

/** Ujung tag pembuka yang dimulai di `start` (`<`): kurawal & string dilompati, jadi `=>`/`>` di ekspresi aman. */
function tagEnd(source: string, start: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start + 1; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return i;
  }
  return source.length - 1;
}

/** Isi kurawal diganti spasi: yang tersisa hanya prop tingkat atas tag (prop di JSX bersarang tidak ikut). */
function topLevel(tag: string): string {
  let depth = 0;
  let out = '';
  for (const c of tag) {
    if (c === '{') depth++;
    if (depth > 0 && c !== '{' && c !== '}') out += c === '\n' ? '\n' : ' ';
    else out += c;
    if (c === '}') depth--;
  }
  return out;
}

/** Semua tag pembuka JSX yang memiliki prop dangerouslySetInnerHTML (termasuk JSX di dalam ekspresi prop). */
function htmlTags(source: string): JsxTag[] {
  const out: JsxTag[] = [];
  for (const m of source.matchAll(/<([A-Za-z][\w.]*)(?=[\s>/])/g)) {
    const end = tagEnd(source, m.index!);
    const tag = source.slice(m.index, end + 1);
    if (!/\sdangerouslySetInnerHTML\s*=/.test(topLevel(tag))) continue;
    out.push({ name: m[1], tag, line: source.slice(0, m.index).split('\n').length });
  }
  return out;
}

/** Ekspresi prop className tingkat atas (`"…"` atau isi `{…}`), atau null bila tidak ada. */
function classNameExpr(tag: string): string | null {
  const at = /\sclassName\s*=\s*/.exec(topLevel(tag));
  if (!at) return null;
  const from = at.index + at[0].length;
  if (tag[from] !== '{') return tag.slice(from).match(/^(["'])(.*?)\1/s)?.[2] ?? '';
  let depth = 0;
  for (let i = from; i < tag.length; i++) {
    if (tag[i] === '{') depth++;
    else if (tag[i] === '}' && --depth === 0) return tag.slice(from + 1, i);
  }
  return tag.slice(from + 1);
}

/** Nama impor default rich-text.module.css di file ini (tahan rename), atau null. */
function rtImportName(source: string): string | null {
  return source.match(/import\s+([A-Za-z_$][\w$]*)\s+from\s+['"][^'"]*\/rich-text\/rich-text\.module\.css['"]/)?.[1] ?? null;
}

const escape = (s: string) => s.replace(/[$]/g, '\\$');

/** Ekspresi memuat `<rt>.root` langsung, atau lewat `const X = …<rt>.root…` di file yang sama (tanpa alias lintas file). */
function usesRoot(expr: string, rt: string, source: string): boolean {
  const root = new RegExp(`(?<![\\w$.])${escape(rt)}\\.root\\b`);
  if (root.test(expr)) return true;
  const locals = [...source.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*([^;]+)/g)]
    .filter((d) => root.test(d[2]))
    .map((d) => d[1]);
  return locals.some((name) => new RegExp(`(?<![\\w$.])${escape(name)}(?![\\w$])`).test(expr));
}

/** Tag dangerouslySetInnerHTML (selain <script>/<style>) yang className-nya tidak memuat rt.root. */
function violations(rel: string, source: string): string[] {
  const rt = rtImportName(source);
  return htmlTags(source)
    .filter((t) => !NON_CMS_TAGS.has(t.name))
    .flatMap((t) => {
      const where = `${rel}:${t.line} › <${t.name}>`;
      const expr = classNameExpr(t.tag);
      if (!rt) return [`${where} file tidak mengimpor rich-text.module.css`];
      if (expr === null) return [`${where} tanpa className (spread props tidak dihitung)`];
      return usesRoot(expr, rt, source) ? [] : [`${where} className tanpa ${rt}.root`];
    });
}

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx')) out.push(p);
  }
  return out;
};

/* ---------------------------------------------------------------------------------------------------
 * Parser benar-benar menangkap pelanggaran (sintetis)
 * --------------------------------------------------------------------------------------------------- */

const IMPORT = "import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';";

describe('parser penjaga (potongan sintetis)', () => {
  it('positif: tanpa className, className tanpa rt.root, dan spread props tertangkap dengan file:baris', () => {
    const tsx = [
      IMPORT,
      '<div dangerouslySetInnerHTML={{ __html: a }} />',
      '<div className={s.content} dangerouslySetInnerHTML={{ __html: b }} />',
      '<Text',
      '  className="prose"',
      '  dangerouslySetInnerHTML={{ __html: c }}',
      '/>',
      '<Box {...props} dangerouslySetInnerHTML={{ __html: d }} />',
    ].join('\n');
    expect(violations('x.tsx', tsx)).toEqual([
      'x.tsx:2 › <div> tanpa className (spread props tidak dihitung)',
      'x.tsx:3 › <div> className tanpa rt.root',
      'x.tsx:4 › <Text> className tanpa rt.root',
      'x.tsx:8 › <Box> tanpa className (spread props tidak dihitung)',
    ]);
  });

  it('positif: rt.root hanya di wadah induk tidak dihitung; elemen dalamnya tertangkap', () => {
    const tsx = [IMPORT, '<section className={rt.root}>', '  <div className={s.body} dangerouslySetInnerHTML={{ __html }} />', '</section>'].join('\n');
    expect(violations('x.tsx', tsx)).toEqual(['x.tsx:3 › <div> className tanpa rt.root']);
  });

  it('positif: file tanpa impor rich-text.module.css tertangkap walau ada teks "rt.root"', () => {
    const tsx = 'const rt = { root: "x" };\n<div className={rt.root} dangerouslySetInnerHTML={{ __html }} />';
    expect(violations('x.tsx', tsx)).toEqual(['x.tsx:2 › <div> file tidak mengimpor rich-text.module.css']);
  });

  it('positif: nama mirip (art.root, rt.rootX, x.rt.root) tidak dihitung sebagai rt.root', () => {
    const tsx = [
      IMPORT,
      '<div className={art.root} dangerouslySetInnerHTML={{ __html: a }} />',
      '<div className={rt.rootX} dangerouslySetInnerHTML={{ __html: b }} />',
      '<div className={x.rt.root} dangerouslySetInnerHTML={{ __html: c }} />',
    ].join('\n');
    expect(violations('x.tsx', tsx)).toHaveLength(3);
  });

  it('negatif: bentuk umum rt.root di elemen itu sendiri lolos', () => {
    const tsx = [
      IMPORT,
      '<Text className={rt.root} fz="sm" dangerouslySetInnerHTML={{ __html: a }} />',
      '<div className={`${d.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: b }} />',
      '<div className={open ? `${s.prose} ${rt.root}` : `${s.prose} ${s.clamped} ${rt.root}`} dangerouslySetInnerHTML={{ __html: c }} />',
      '<div className={cx(rt.root, s.body)} dangerouslySetInnerHTML={{ __html: d }} />',
      '<div',
      '  onClick={() => a > b}',
      '  className={clsx(s.body, rt.root)}',
      '  dangerouslySetInnerHTML={{ __html: e }}',
      '/>',
    ].join('\n');
    expect(violations('x.tsx', tsx)).toEqual([]);
  });

  it('negatif: variabel const lokal yang memuat rt.root dan impor yang diganti nama lolos', () => {
    const local = [IMPORT, 'const cls = `${s.prose} ${rt.root}`;', '<div className={extra ? `${cls} ${extra}` : cls} dangerouslySetInnerHTML={{ __html }} />'].join('\n');
    expect(violations('x.tsx', local)).toEqual([]);
    const renamed = "import penetral from '@/app/(public)/_com/rich-text/rich-text.module.css';\n<div className={penetral.root} dangerouslySetInnerHTML={{ __html }} />";
    expect(violations('x.tsx', renamed)).toEqual([]);
    const otherLocal = [IMPORT, 'const cls = s.prose;', '<div className={cls} dangerouslySetInnerHTML={{ __html }} />'].join('\n');
    expect(violations('x.tsx', otherLocal)).toEqual(['x.tsx:3 › <div> className tanpa rt.root']);
  });

  it('pengecualian berbasis tag: <script>/<style> lolos walau tanpa rt.root dan tanpa impor', () => {
    const tsx = [
      '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />',
      '<style dangerouslySetInnerHTML={{ __html: css }} />',
      '<div dangerouslySetInnerHTML={{ __html }} />',
    ].join('\n');
    expect(violations('x.tsx', tsx)).toEqual(['x.tsx:3 › <div> file tidak mengimpor rich-text.module.css']);
  });

  it('parser: prop di JSX bersarang tidak dihitung milik tag luar; generik TypeScript diabaikan', () => {
    const tsx = [
      IMPORT,
      'const [a] = useState<string>("");',
      '<Popover render={<div className={rt.root} dangerouslySetInnerHTML={{ __html }} />} className={s.pop} />',
    ].join('\n');
    expect(htmlTags(tsx).map((t) => `${t.name}:${t.line}`)).toEqual(['div:3']);
    expect(violations('x.tsx', tsx)).toEqual([]);
  });
});

/* ---------------------------------------------------------------------------------------------------
 * Pindai src/app/(public)
 * --------------------------------------------------------------------------------------------------- */

describe('src/app/(public): HTML CMS memakai penetral rt.root', () => {
  const tsx = walk(PUBLIC_DIR).map((abs) => ({
    rel: path.relative(PUBLIC_DIR, abs).split(path.sep).join('/'),
    src: readFileSync(abs, 'utf8'),
  }));

  it('pindaian benar-benar membaca pemakaian (bukan direktori kosong)', () => {
    expect(tsx.length).toBeGreaterThan(100);
    const tagged = tsx.filter((f) => htmlTags(f.src).length > 0).map((f) => f.rel);
    expect(tsx.flatMap((f) => htmlTags(f.src)).length).toBeGreaterThanOrEqual(60);
    expect(tagged).toContain('(pages)/pemerintahan/profil/_com/ProfilCard.tsx');
  });

  it('setiap elemen dangerouslySetInnerHTML (selain <script>/<style>) memasang rt.root di elemen itu sendiri', () => {
    const bad = tsx.flatMap((f) => violations(f.rel, f.src));
    expect(bad, `HTML CMS tanpa penetral rich text.\n${bad.join('\n')}\n\n${DOC}`).toEqual([]);
  });
});
