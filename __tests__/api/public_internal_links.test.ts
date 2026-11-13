// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import navbarListMenu from '@/con/navbar-list-menu';
import { flattenMenu } from '@/app/(public)/_com/searchMenu';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'src/app/(public)');
const PAGES_DIR = path.join(PUBLIC_DIR, '(pages)');

// Tautan statis di kode publik: href="/x", link: "/x", router.push('/x'), redirect('/x').
const LINK_PATTERN = /(?:href=\{?|(?:href|link):\s*|\.push\(|\.replace\(|redirect\()\s*["'`](\/[^"'`$?#\s]*)["'`]/g;
const NOT_A_PAGE = /^\/(api|assets|_next)\//;

function staticLinks(): { url: string; at: string }[] {
  const files = readdirSync(PUBLIC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.tsx?$/.test(f));
  return files.flatMap((rel) => {
    const src = readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    return [...src.matchAll(LINK_PATTERN)]
      .map((m) => ({ url: m[1], at: `${rel}:${src.slice(0, m.index).split('\n').length}` }))
      .filter(({ url }) => url !== '/' && !NOT_A_PAGE.test(url));
  });
}

describe('tautan internal situs publik', () => {
  const routes = publicRoutes();

  it('setiap href navbar (termasuk submenu tersembunyi) punya halaman', () => {
    const broken = flattenMenu(navbarListMenu)
      .map((item) => item.href)
      .filter((href) => !matchesRealPage(href, routes));
    expect(broken).toEqual([]);
  });

  it('setiap tautan statis di kode publik (footer, tombol kembali, dll) punya halaman', () => {
    const links = staticLinks();
    expect(links.length).toBeGreaterThan(10); // pola pemindai masih menangkap tautan
    const broken = links.filter(({ url }) => !matchesRealPage(url, routes));
    expect(broken).toEqual([]);
  });

  it('tidak ada route placeholder [sub] yang menggemakan segmen URL', () => {
    expect(routes.filter((r) => r.includes('[sub]'))).toEqual([]);
  });

  it('menu utama tanpa halaman induk tidak punya page.tsx (alamatnya 404)', () => {
    const menuRoots = ['ekonomi', 'inovasi', 'keamanan', 'kesehatan', 'lingkungan', 'pemerintahan', 'pendidikan', 'module'];
    const withIndex = menuRoots.filter((d) => existsSync(path.join(PAGES_DIR, d, 'page.tsx')));
    expect(withIndex).toEqual([]);
  });
});
