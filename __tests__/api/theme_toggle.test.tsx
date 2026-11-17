// @vitest-environment node
// Tombol tema terang/gelap navbar + cakupan tema gelap (admin/akun selalu terang).
// jsdom rusak → renderToStaticMarkup; klik & pergantian tema diverifikasi manual di browser.
// Tombol hanya dirender saat NODE_ENV development (THEME_TOGGLE_VISIBLE, sampai Fase 4).
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isThemeToggleVisible,
  nextColorScheme,
  THEME_LABEL_TO_DARK,
  THEME_LABEL_TO_LIGHT,
} from '@/app/(public)/_com/theme-toggle.logic';
import { siteColorSchemeManager } from '@/app/_com/site-color-scheme';
import {
  COLOR_SCHEME_SCOPE_HEAD_SCRIPT,
  isLightOnlyPath,
  LIGHT_ONLY_PATH_PREFIXES,
} from '@/lib/color-scheme-scope';

const APP_DIR = path.resolve(__dirname, '../../src/app');

/** Folder teratas src/app yang bukan halaman (tidak perlu masuk daftar selalu-terang). */
const NON_PAGE_DIRS = new Set([
  'api', // route handler API, tanpa tampilan
  'context', // React context (MusicContext), bukan rute
]);

/**
 * Render tombol dengan NODE_ENV tertentu. THEME_TOGGLE_VISIBLE dibaca saat modul dimuat, jadi modul
 * dimuat ulang; MantineProvider ikut dimuat ulang agar konteksnya sama dengan milik komponen.
 */
const render = async (scheme: 'light' | 'dark', nodeEnv = 'development') => {
  vi.stubEnv('NODE_ENV', nodeEnv);
  vi.resetModules();
  const { MantineProvider } = await import('@mantine/core');
  const { NavbarThemeToggle } = await import('@/app/(public)/_com/NavbarThemeToggle');
  return renderToStaticMarkup(
    <MantineProvider forceColorScheme={scheme}>
      <NavbarThemeToggle />
    </MantineProvider>,
  );
};

describe('nextColorScheme', () => {
  it('membalik terang ↔ gelap', () => {
    expect(nextColorScheme('light')).toBe('dark');
    expect(nextColorScheme('dark')).toBe('light');
  });

  it('atribut kosong/tak dikenal dianggap terang → berikutnya gelap', () => {
    expect(nextColorScheme(null)).toBe('dark');
    expect(nextColorScheme(undefined)).toBe('dark');
    expect(nextColorScheme('auto')).toBe('dark');
  });
});

describe('tombol tema hanya di development (sampai plan-dark-theme Fase 4)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isThemeToggleVisible: hanya "development"', () => {
    expect(isThemeToggleVisible('development')).toBe(true);
    expect(isThemeToggleVisible('production')).toBe(false);
    expect(isThemeToggleVisible('test')).toBe(false);
    expect(isThemeToggleVisible(undefined)).toBe(false);
  });

  it('build produksi: tombol tidak dirender sama sekali (tanpa ruang kosong di navbar)', async () => {
    for (const scheme of ['light', 'dark'] as const) {
      // keluaran yang tersisa hanya <style> variabel CSS milik MantineProvider
      const html = (await render(scheme, 'production')).replace(/<style[\s\S]*?<\/style>/g, '');
      expect(html).toBe('');
    }
  });

  it('development: tombol dirender', async () => {
    expect(await render('light', 'development')).toContain('<button');
  });
});

describe('NavbarThemeToggle (development)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('tombol berisi ikon bulan + label "gelap" (tampil di terang) dan matahari + label "terang" (tampil di gelap)', async () => {
    const html = await render('light');
    expect(html).toContain('type="button"');
    expect(html).toMatch(/class="mantine-dark-hidden"[^>]*>Aktifkan tema gelap</);
    expect(html).toMatch(/class="mantine-light-hidden"[^>]*>Aktifkan tema terang</);
    expect(html).toMatch(/<svg[^>]*tabler-icon-moon[^>]*mantine-dark-hidden|<svg[^>]*mantine-dark-hidden[^>]*tabler-icon-moon/);
    expect(html).toMatch(/<svg[^>]*tabler-icon-sun[^>]*mantine-light-hidden|<svg[^>]*mantine-light-hidden[^>]*tabler-icon-sun/);
    expect(html).toContain(THEME_LABEL_TO_DARK);
    expect(html).toContain(THEME_LABEL_TO_LIGHT);
  });

  it('HTML tombol sama persis di kedua skema (ikon/label dipilih CSS → tanpa hydration mismatch)', async () => {
    const button = (html: string) => html.match(/<button[\s\S]*<\/button>/)?.[0];
    const light = button(await render('light'));
    expect(light).toBeTruthy();
    expect(button(await render('dark'))).toBe(light);
  });

  it('ikon disembunyikan dari pembaca layar; nama tombol dari label tersembunyi visual', async () => {
    const html = await render('light');
    expect(html).toMatch(/aria-hidden="true"[^>]*>\s*<svg/);
    expect(html).toContain('mantine-VisuallyHidden-root');
  });
});

describe('isLightOnlyPath', () => {
  it('admin, konsol developer, dan halaman akun selalu terang', () => {
    expect(isLightOnlyPath('/admin')).toBe(true);
    expect(isLightOnlyPath('/admin/landing-page/profile/program-inovasi')).toBe(true);
    expect(isLightOnlyPath('/dev/jenna')).toBe(true);
    expect(isLightOnlyPath('/login')).toBe(true);
    expect(isLightOnlyPath('/profile')).toBe(true);
  });

  it('situs publik boleh gelap; cocok per segmen, bukan awalan teks', () => {
    expect(isLightOnlyPath('/')).toBe(false);
    expect(isLightOnlyPath('/pemerintahan/profil')).toBe(false);
    expect(isLightOnlyPath('/administrasi')).toBe(false);
    expect(isLightOnlyPath('/profil')).toBe(false);
    expect(isLightOnlyPath(null)).toBe(false);
  });

  it('setiap folder rute teratas src/app di luar (public) terdaftar selalu-terang', () => {
    const routeDirs = readdirSync(APP_DIR).filter(
      (name) =>
        statSync(path.join(APP_DIR, name)).isDirectory() &&
        !name.startsWith('(') && // route group: (public) = situs publik
        !name.startsWith('_') && // folder privat (_com)
        !NON_PAGE_DIRS.has(name),
    );
    const listed = new Set<string>(LIGHT_ONLY_PATH_PREFIXES);
    expect(routeDirs.filter((name) => !listed.has(`/${name}`))).toEqual([]);
  });
});

describe('COLOR_SCHEME_SCOPE_HEAD_SCRIPT', () => {
  const run = (pathname: string) => {
    const calls: [string, string][] = [];
    // test-only: document & location tiruan; skrip <head> memakai global dengan nama yang sama
    const document = { documentElement: { setAttribute: (k: string, v: string) => calls.push([k, v]) } };
    new Function('location', 'document', COLOR_SCHEME_SCOPE_HEAD_SCRIPT)({ pathname }, document);
    return calls;
  };

  it('memaksa terang di area selalu-terang', () => {
    expect(run('/admin/berita')).toEqual([['data-mantine-color-scheme', 'light']]);
    expect(run('/login')).toEqual([['data-mantine-color-scheme', 'light']]);
  });

  it('tidak menyentuh atribut di situs publik', () => {
    expect(run('/')).toEqual([]);
    expect(run('/administrasi')).toEqual([]);
  });
});

describe('siteColorSchemeManager.get', () => {
  const g = globalThis as { window?: unknown };
  const stubWindow = (pathname: string, stored: string) => {
    // test-only: window minimal untuk localStorageColorSchemeManager Mantine
    g.window = { location: { pathname }, localStorage: { getItem: () => stored } };
  };

  afterEach(() => {
    delete g.window;
  });

  it('admin → "light" walau tersimpan gelap', () => {
    stubWindow('/admin', 'dark');
    expect(siteColorSchemeManager.get('light')).toBe('light');
  });

  it('situs publik → pilihan tersimpan', () => {
    stubWindow('/pemerintahan/berita/semua', 'dark');
    expect(siteColorSchemeManager.get('light')).toBe('dark');
  });

  it('tanpa window (render server) → nilai default', () => {
    expect(siteColorSchemeManager.get('light')).toBe('light');
  });
});
