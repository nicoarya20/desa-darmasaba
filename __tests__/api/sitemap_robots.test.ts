// @vitest-environment node
// sitemap.xml (halaman statis, ikut visibilitas menu) dan robots.txt situs publik.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import type { MenuItem } from '../../types/menu-item';
import { HOME_PATH, REDIRECT_ONLY_PATHS, sitemapPaths } from '@/app/(public)/_com/sitemap.logic';
import robots from '@/app/robots';
import { SITE_URL } from '@/lib/site-url';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';

const submenus: MenuItem[] = navbarListMenu.flatMap((menu) => (menu.children ?? []).filter((c) => c.href));
const DEFAULT_HIDDEN = submenus.filter((c) => c.hidden).map((c) => c.href as string);
const DEFAULT_VISIBLE = submenus.filter((c) => !c.hidden).map((c) => c.href as string);

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
/** URL statis → isi page.tsx-nya (route group `(x)` dibuang; route dinamis `[x]` tidak dipetakan). */
const staticPageSource = new Map<string, string>(
  readdirSync(PUBLIC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((f) => path.basename(f) === 'page.tsx')
    .map((f) => {
      const segs = path.dirname(f).split(path.sep).filter((s) => s !== '.' && !/^\(.*\)$/.test(s));
      return [`/${segs.join('/')}`, readFileSync(path.join(PUBLIC_DIR, f), 'utf8')] as const;
    }),
);

const PROFIL_PPID = '/ppid/profil-ppid'; // test-only
const DATA_KESEHATAN = '/kesehatan/data-kesehatan-warga'; // test-only, default hidden di config
const GRAFIK_PENYAKIT = '/kesehatan/data-kesehatan-warga/grafik-penyakit'; // test-only, halaman tambahan di bawahnya

describe('sitemapPaths', () => {
  const paths = sitemapPaths({});

  it('beranda ada di urutan pertama, plus Peta Informasi', () => {
    expect(paths[0]).toBe(HOME_PATH);
    expect(paths).toContain('/peta-informasi');
  });

  it('memuat semua submenu navbar yang terlihat secara default', () => {
    expect(DEFAULT_VISIBLE.length).toBeGreaterThan(0);
    for (const href of DEFAULT_VISIBLE) expect(paths).toContain(href);
  });

  it('bagian ?query/#hash dibuang dan hasilnya tanpa duplikat', () => {
    expect(paths.every((p) => !/[?#]/.test(p))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
    // Section Dashboard Kependudukan (#banjar, #agama, …) jadi satu path.
    expect(paths.filter((p) => p === '/kependudukan/dashboard')).toHaveLength(1);
  });

  it('hanya path internal berawalan "/" yang menunjuk halaman nyata', () => {
    const routes = publicRoutes();
    const missing = paths.filter((p) => p !== HOME_PATH && !matchesRealPage(p, routes));
    expect(missing).toEqual([]);
    expect(paths.every((p) => p.startsWith('/') && !p.startsWith('//'))).toBe(true);
  });

  it('tidak memuat route yang page.tsx-nya redirect (sitemap hanya URL 200)', () => {
    for (const href of REDIRECT_ONLY_PATHS) {
      expect(staticPageSource.get(href)).toMatch(/\bredirect\(/);
      expect(paths).not.toContain(href);
    }
    const redirecting = paths.filter((p) => /\bredirect\(/.test(staticPageSource.get(p) ?? ''));
    expect(redirecting).toEqual([]);
  });

  it('alamat induk menu tanpa halaman (/keamanan, /ekonomi, …) tidak masuk', () => {
    expect(paths).not.toContain('/keamanan');
    expect(paths).not.toContain('/ekonomi');
  });

  it('submenu default hidden (beserta halaman tambahan di bawahnya) tidak masuk', () => {
    expect(DEFAULT_HIDDEN).toContain(DATA_KESEHATAN);
    for (const href of DEFAULT_HIDDEN) expect(paths).not.toContain(href);
    expect(paths).not.toContain(GRAFIK_PENYAKIT);
  });

  it('override DB yang menyembunyikan submenu membuangnya dari sitemap', () => {
    expect(paths).toContain(PROFIL_PPID);
    expect(sitemapPaths({ [PROFIL_PPID]: false })).not.toContain(PROFIL_PPID);
  });

  it('override DB yang memunculkan submenu default hidden ikut memasukkannya', () => {
    const shown = sitemapPaths({ [DATA_KESEHATAN]: true });
    expect(shown).toContain(DATA_KESEHATAN);
    expect(shown).toContain(GRAFIK_PENYAKIT);
  });

  it('urutan stabil: panggilan berulang menghasilkan daftar yang sama', () => {
    expect(sitemapPaths({})).toEqual(paths);
  });
});

describe('robots', () => {
  const result = robots();
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;

  it('izinkan "/" untuk semua user agent dan tutup rute non-publik', () => {
    expect(rule.userAgent).toBe('*');
    expect(rule.allow).toBe('/');
    expect(rule.disallow).toEqual([
      '/admin',
      '/api',
      '/dev',
      '/login',
      '/registrasi',
      '/profile',
      '/auth',
      '/validasi',
      '/waiting-room',
    ]);
  });

  it('tidak menutup segmen awal halaman publik mana pun (Disallow = pencocokan prefix)', () => {
    const disallow = ([] as string[]).concat(rule.disallow ?? []);
    const blocked = sitemapPaths({}).filter((p) => disallow.some((d) => p.startsWith(d)));
    expect(blocked).toEqual([]);
  });

  it('menunjuk sitemap.xml di URL situs', () => {
    expect(result.sitemap).toBe(new URL('/sitemap.xml', SITE_URL).toString());
  });
});
