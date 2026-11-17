// @vitest-environment node
// Resolver variabel CSS Mantine situs: shade gelap palet A tanpa mengubah tema terang.
import { createTheme, mergeMantineTheme, DEFAULT_THEME, v8CssVariablesResolver } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import { DARK_SHADE_TOKENS, siteCssVariablesResolver } from '@/app/_com/site-css-variables-resolver';

const theme = mergeMantineTheme(DEFAULT_THEME, createTheme({ primaryColor: 'blue' })); // test-only

describe('siteCssVariablesResolver', () => {
  const base = v8CssVariablesResolver(theme);
  const site = siteCssVariablesResolver(theme);

  it('tema terang & variabel umum identik dengan v8CssVariablesResolver', () => {
    expect(site.light).toEqual(base.light);
    expect(site.variables).toEqual(base.variables);
  });

  it('bagian gelap = v8 + 10 shade dark dipetakan ke token --c-*', () => {
    expect(Object.keys(DARK_SHADE_TOKENS)).toEqual(
      Array.from({ length: 10 }, (_, i) => `--mantine-color-dark-${i}`),
    );
    expect(site.dark).toEqual({ ...base.dark, ...DARK_SHADE_TOKENS });
    expect(site.dark['--mantine-color-dark-6']).toBe('var(--c-tile)');
    expect(site.dark['--mantine-color-dark-7']).toBe('var(--c-bg-alt)');
  });

  it('variabel semantik gelap v8 tetap merujuk shade (ikut terpetakan)', () => {
    expect(site.dark['--mantine-color-body']).toBe('var(--mantine-color-dark-7)');
    expect(site.dark['--mantine-color-dimmed']).toBe('var(--mantine-color-dark-2)');
    expect(site.dark['--mantine-color-placeholder']).toBe('var(--mantine-color-dark-3)');
  });

  it('setiap token yang dirujuk ada di kontrak theme-tokens.css', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/app/theme-tokens.css', 'utf8');
    for (const value of Object.values(DARK_SHADE_TOKENS)) {
      const name = value.match(/var\((--c-[a-z0-9-]+)\)/)?.[1];
      expect(name, value).toBeTruthy();
      expect(css).toContain(`${name}:`);
    }
  });
});
