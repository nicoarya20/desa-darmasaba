// @vitest-environment node
// Tombol tema terang/gelap navbar + cakupan tema gelap (admin/akun selalu terang).
// jsdom rusak → renderToStaticMarkup; klik & pergantian tema diverifikasi manual di browser.
// Fase 4: tombol tampil untuk publik di semua build; skema bawaan "auto" (ikuti OS) bila belum memilih.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorSchemeScript } from '@mantine/core';
import {
  nextColorScheme,
  THEME_LABEL_TO_DARK,
  THEME_LABEL_TO_LIGHT,
} from '@/app/(public)/_com/theme-toggle.logic';
import { readStoredColorScheme, siteColorSchemeManager } from '@/app/_com/site-color-scheme';
import {
  COLOR_SCHEME_SCOPE_HEAD_SCRIPT,
  DEFAULT_COLOR_SCHEME,
  isLightOnlyPath,
  LIGHT_ONLY_PATH_PREFIXES,
  syncThemeColorMeta,
  THEME_COLOR,
  THEME_COLOR_VIEWPORT,
} from '@/lib/color-scheme-scope';

const APP_DIR = path.resolve(__dirname, '../../src/app');

/** Folder teratas src/app yang bukan halaman (tidak perlu masuk daftar selalu-terang). */
const NON_PAGE_DIRS = new Set([
  'api', // route handler API, tanpa tampilan
  'context', // React context (MusicContext), bukan rute
]);

/**
 * Render tombol dengan NODE_ENV tertentu. Modul dimuat ulang supaya gating berbasis env yang dibaca saat
 * modul dimuat pun ikut tertangkap; MantineProvider ikut dimuat ulang agar konteksnya sama dengan komponen.
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

  it('skema "auto": atribut sudah hasil resolusi OS → OS gelap, klik pertama ke terang', () => {
    // ColorSchemeScript/MantineProvider tidak pernah menulis "auto" ke atribut, hanya light/dark
    expect(nextColorScheme('dark')).toBe('light');
  });

  it('atribut kosong/tak dikenal dianggap terang → berikutnya gelap', () => {
    expect(nextColorScheme(null)).toBe('dark');
    expect(nextColorScheme(undefined)).toBe('dark');
    expect(nextColorScheme('auto')).toBe('dark');
  });
});

describe('tombol tema tampil untuk publik (plan-dark-theme Fase 4)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dirender di build produksi maupun development, di kedua skema', async () => {
    for (const nodeEnv of ['production', 'development', 'test']) {
      for (const scheme of ['light', 'dark'] as const) {
        const html = await render(scheme, nodeEnv);
        expect(html).toContain('<button');
        expect(html).toContain(THEME_LABEL_TO_DARK);
      }
    }
  });

  it('HTML produksi = development (tanpa cabang khusus env)', async () => {
    const button = (html: string) => html.match(/<button[\s\S]*<\/button>/)?.[0];
    const dev = button(await render('light', 'development'));
    expect(dev).toBeTruthy();
    expect(button(await render('light', 'production'))).toBe(dev);
  });
});

describe('NavbarThemeToggle', () => {
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
  const stubWindow = (pathname: string, stored: string | null) => {
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

describe('skema bawaan "auto" (ikuti OS bila belum memilih)', () => {
  const g = globalThis as { window?: unknown };
  const stubStorage = (pathname: string, stored: string | null) => {
    // test-only: window minimal untuk localStorageColorSchemeManager Mantine
    g.window = { location: { pathname }, localStorage: { getItem: () => stored } };
  };

  afterEach(() => {
    delete g.window;
  });

  it('DEFAULT_COLOR_SCHEME = "auto"', () => {
    expect(DEFAULT_COLOR_SCHEME).toBe('auto');
  });

  it('layout akar & MantineProvider memakai DEFAULT_COLOR_SCHEME, bukan literal "light"', () => {
    const layout = readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf8');
    const provider = readFileSync(path.join(APP_DIR, '_com/SiteMantineProvider.tsx'), 'utf8');
    expect(layout).toContain('<ColorSchemeScript defaultColorScheme={DEFAULT_COLOR_SCHEME} />');
    expect(provider).toContain('defaultColorScheme={DEFAULT_COLOR_SCHEME}');
    expect(`${layout}\n${provider}`).not.toMatch(/defaultColorScheme="(light|dark)"/);
  });

  it('pemulihan admin → publik: belum memilih → "auto"; pilihan tersimpan tetap utuh', () => {
    stubStorage('/admin', null);
    expect(readStoredColorScheme()).toBe('auto');
    stubStorage('/admin', 'garbage');
    expect(readStoredColorScheme()).toBe('auto');
    stubStorage('/admin', 'dark');
    expect(readStoredColorScheme()).toBe('dark');
    stubStorage('/admin', 'light');
    expect(readStoredColorScheme()).toBe('light');
  });

  it('pemuatan pertama di publik tanpa pilihan → "auto"; admin tetap "light"', () => {
    stubStorage('/', null);
    expect(siteColorSchemeManager.get(DEFAULT_COLOR_SCHEME)).toBe('auto');
    stubStorage('/admin/berita', null);
    expect(siteColorSchemeManager.get(DEFAULT_COLOR_SCHEME)).toBe('light');
  });
});

describe('<head>: ColorSchemeScript "auto" lalu COLOR_SCHEME_SCOPE_HEAD_SCRIPT', () => {
  const mantineScript = renderToStaticMarkup(
    <ColorSchemeScript defaultColorScheme={DEFAULT_COLOR_SCHEME} />,
  ).match(/<script[^>]*>([\s\S]*)<\/script>/)?.[1];

  /** Jalankan kedua skrip <head> berurutan seperti di layout; kembalikan atribut akhir <html>. */
  const runHead = (pathname: string, osDark: boolean, stored: string | null) => {
    const attrs: Record<string, string> = {};
    // test-only: window/document/location tiruan untuk skrip inline <head>
    const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
    const window = {
      localStorage: { getItem: () => stored },
      matchMedia: (q: string) => ({ matches: q === '(prefers-color-scheme: dark)' && osDark }),
    };
    new Function('window', 'document', mantineScript!)(window, document);
    new Function('location', 'document', COLOR_SCHEME_SCOPE_HEAD_SCRIPT)({ pathname }, document);
    return attrs['data-mantine-color-scheme'];
  };

  it('skrip Mantine terbaca dari render', () => {
    expect(mantineScript).toContain('prefers-color-scheme: dark');
  });

  it('publik tanpa pilihan ikut OS', () => {
    expect(runHead('/', true, null)).toBe('dark');
    expect(runHead('/', false, null)).toBe('light');
  });

  it('pilihan tersimpan menang atas OS', () => {
    expect(runHead('/', true, 'light')).toBe('light');
    expect(runHead('/', false, 'dark')).toBe('dark');
  });

  it('admin/akun tetap terang sebelum paint walau OS gelap (dan walau tersimpan gelap)', () => {
    expect(runHead('/admin', true, null)).toBe('light');
    expect(runHead('/login', true, 'dark')).toBe('light');
  });

  it('di layout, skrip cakupan dipasang SETELAH ColorSchemeScript', () => {
    const layout = readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf8');
    const scheme = layout.indexOf('<ColorSchemeScript');
    const scope = layout.indexOf('__html: COLOR_SCHEME_SCOPE_HEAD_SCRIPT');
    expect(scheme).toBeGreaterThan(-1);
    expect(scope).toBeGreaterThan(scheme);
  });
});

describe('THEME_COLOR_VIEWPORT (<meta name="theme-color"> sebelum hidrasi)', () => {
  it('satu warna per prefers-color-scheme, sesuai THEME_COLOR', () => {
    expect(THEME_COLOR_VIEWPORT).toEqual([
      { media: '(prefers-color-scheme: light)', color: THEME_COLOR.light },
      { media: '(prefers-color-scheme: dark)', color: THEME_COLOR.dark },
    ]);
  });

  it('layout memakainya di viewport, tanpa theme-color statis di metadata.other', () => {
    const layout = readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf8');
    expect(layout).toContain('themeColor: THEME_COLOR_VIEWPORT');
    expect(layout).not.toMatch(/"theme-color":/);
  });
});

describe('syncThemeColorMeta (setelah hidrasi & tiap navigasi client)', () => {
  /** test-only: dokumen tiruan dengan dua meta ber-media seperti keluaran viewport.themeColor. */
  const fakeDoc = (scheme: string | null) => {
    const writes: string[] = [];
    const metas = THEME_COLOR_VIEWPORT.map(({ color }) => {
      let content = color;
      return {
        getAttribute: () => content,
        setAttribute: (_: string, v: string) => {
          writes.push(v);
          content = v;
        },
      };
    });
    const doc = {
      documentElement: { getAttribute: () => scheme },
      querySelectorAll: () => metas,
    } as unknown as Parameters<typeof syncThemeColorMeta>[0];
    return { doc, writes, contents: () => metas.map((m) => m.getAttribute()) };
  };

  it('pilihan terang di OS gelap → kedua meta putih (meta ber-media gelap ditimpa)', () => {
    const { doc, contents } = fakeDoc('light');
    syncThemeColorMeta(doc);
    expect(contents()).toEqual([THEME_COLOR.light, THEME_COLOR.light]);
  });

  it('skema gelap → kedua meta hitam', () => {
    const { doc, contents } = fakeDoc('dark');
    syncThemeColorMeta(doc);
    expect(contents()).toEqual([THEME_COLOR.dark, THEME_COLOR.dark]);
  });

  it('hanya menulis meta yang berbeda (tanpa mutasi berulang untuk observer)', () => {
    const { doc, writes } = fakeDoc('dark');
    syncThemeColorMeta(doc);
    expect(writes).toEqual([THEME_COLOR.dark]);
    syncThemeColorMeta(doc);
    expect(writes).toEqual([THEME_COLOR.dark]);
  });
});
