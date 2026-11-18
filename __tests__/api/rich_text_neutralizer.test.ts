// @vitest-environment node
// Penetral warna rich text CMS (src/app/(public)/_com/rich-text/rich-text.module.css): di tema gelap warna & latar
// inline dari editor admin / tempelan Word dinetralkan; tema terang tidak disentuh sama sekali.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import presetMantine from 'postcss-preset-mantine';
import { describe, expect, it } from 'vitest';

const CSS_PATH = path.resolve(__dirname, '../../src/app/(public)/_com/rich-text/rich-text.module.css');
const DARK = "[data-mantine-color-scheme='dark']";

/** Kompilasi seperti pipeline Next (postcss-preset-mantine membuka @mixin dark), kembalikan aturan datar. */
async function compiledRules() {
  const out = await postcss([presetMantine()]).process(readFileSync(CSS_PATH, 'utf8'), { from: undefined });
  const rules: { selectors: string[]; decls: Record<string, string> }[] = [];
  out.root.walkRules((rule) => {
    const decls: Record<string, string> = {};
    rule.walkDecls((d) => {
      decls[d.prop] = `${d.value}${d.important ? ' !important' : ''}`;
    });
    if (Object.keys(decls).length) rules.push({ selectors: rule.selectors.map((s) => s.trim()), decls });
  });
  return rules;
}

const findRule = (rules: Awaited<ReturnType<typeof compiledRules>>, needle: string) =>
  rules.find((r) => r.selectors.some((s) => s.includes(needle)));

describe('rich-text.module.css: penetral warna inline CMS', () => {
  it('semua aturan hanya berlaku di tema gelap (tema terang identik)', async () => {
    const rules = await compiledRules();
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) for (const s of r.selectors) expect(s.startsWith(`${DARK} .root`), s).toBe(true);
  });

  it('color inline → warisan wadah, tanpa menyentuh background-color/border-color', async () => {
    const rule = findRule(await compiledRules(), "[style^='color' i]");
    expect(rule?.decls.color).toBe('inherit !important');
    const sel = rule?.selectors.join(',') ?? '';
    expect(sel).toContain("[style*='; color' i]");
    expect(sel).toContain('font[color]');
    expect(sel).not.toMatch(/\[style\*='-?color/);
  });

  it('tautan berwarna inline → --c-brand', async () => {
    const rule = findRule(await compiledRules(), '.root a:is(');
    expect(rule?.decls.color).toBe('var(--c-brand) !important');
  });

  it('latar inline (style background / bgcolor) → transparan', async () => {
    const rule = findRule(await compiledRules(), '[bgcolor]');
    expect(rule?.decls['background-color']).toBe('transparent !important');
  });

  it('<mark> sorotan redup dengan teks --c-ink, juga bila ber-style inline', async () => {
    const rule = findRule(await compiledRules(), '.root mark[style]');
    expect(rule?.selectors).toContain(`${DARK} .root mark`);
    expect(rule?.decls.color).toBe('var(--c-ink) !important');
    expect(rule?.decls['background-color']).toBe('#5c4b00 !important');
  });
});
