// @vitest-environment node
// Perpustakaan Digital jadi halaman penghubung: URL katalog lama (dibagikan warga, terindeks) wajib redirect permanen,
// navbar/pencarian/Jenna tidak lagi mengarah ke katalog atau form pinjam, form pinjam bukan endpoint publik, menu
// admin tetap ber-ID sama dengan path tab baru, dan migrasi pengaturan idempoten.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import getDetailUrl from '@/app/(public)/_com/searchUrl';
import { navBar } from '@/app/admin/_com/list_PageAdmin';
import navbarListMenu from '@/con/navbar-list-menu';
import { isPublicPostPath } from '@/lib/auth-policy';
import { buildPublicRoutes } from '@/lib/jenna/knowledge/sitemap';
import { renderStaticGuide } from '@/lib/jenna/knowledge/static-guide';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';

const PAGE = '/pendidikan/perpustakaan-digital';
const ROOT = path.resolve(__dirname, '../..');

describe('redirect URL katalog lama (next.config)', () => {
  it.each([`${PAGE}/semua`, `${PAGE}/anak-dan-remaja`, `${PAGE}/anak-dan-remaja/cmkbuku0001`])(
    '%s → halaman penghubung (permanent)',
    async (from) => {
      const redirects = await loadRedirects();
      expect(resolveRedirect(redirects, from)).toBe(PAGE);
      expect(redirects.find((r) => resolveRedirect([r], from) !== null)?.permanent).toBe(true);
    },
  );

  it('halaman penghubung sendiri tidak ditangkap redirect dan ada page-nya', async () => {
    expect(resolveRedirect(await loadRedirects(), PAGE)).toBeNull();
    expect(matchesRealPage(PAGE, publicRoutes())).toBe(true);
  });

  it('halaman katalog/detail lama sudah dihapus', () => {
    const routes = publicRoutes();
    expect(matchesRealPage(`${PAGE}/semua`, routes)).toBe(false);
    expect(matchesRealPage(`${PAGE}/anak-dan-remaja/cmkbuku0001`, routes)).toBe(false);
  });
});

describe('navbar, pencarian, Jenna', () => {
  it('navbar Pendidikan › Perpustakaan Digital → halaman penghubung, nama menu tetap', () => {
    const pendidikan = navbarListMenu.find((m) => m.name === 'Pendidikan');
    const item = pendidikan?.children?.find((c) => c.name === 'Perpustakaan Digital');
    expect(item?.href).toBe(PAGE);
  });

  it('pencarian global tidak lagi memuat/menautkan buku lama', () => {
    const search = readFileSync(path.join(ROOT, 'src/app/api/[[...slugs]]/_lib/search/findMany.ts'), 'utf8');
    expect(search).not.toContain('dataPerpustakaan');
    expect(getDetailUrl({ type: 'dataPerpustakaan', id: 'x' })).toBe('/');
  });

  it('Jenna menautkan halaman penghubung, bukan form pinjam', () => {
    const guide = renderStaticGuide(new Set(buildPublicRoutes({}, [])));
    expect(guide).toContain(`](${PAGE})`);
    expect(guide).not.toMatch(/form pinjam|Peminjaman buku/);
  });
});

describe('akses', () => {
  it('POST pinjam buku bukan form publik lagi', () => {
    expect(isPublicPostPath('/api/pendidikan/perpustakaandigital/peminjamanbuku/create')).toBe(false);
  });

  it('menu admin: ID tetap, path ke tab Website Perpustakaan di bawah basePath yang sama', () => {
    const menu = navBar.flatMap((s) => s.children ?? []).find((c) => c.id === 'pendidikan.perpustakaan-digital');
    expect(menu?.path).toBe('/admin/pendidikan/perpustakaan-digital/website');
    expect(menu?.basePath).toBe('/admin/pendidikan/perpustakaan-digital');
  });
});

describe('migrasi 20261117180000_perpustakaan_config (statis, tanpa DB)', () => {
  const sql = readFileSync(path.join(ROOT, 'prisma/migrations/20261117180000_perpustakaan_config/migration.sql'), 'utf8');
  const code = sql.replace(/--.*$/gm, '').replace(/\s+/g, ' ');

  it('idempoten: CREATE TABLE IF NOT EXISTS + baris awal hanya bila belum ada baris aktif', () => {
    expect(code).toContain('CREATE TABLE IF NOT EXISTS "PerpustakaanConfig"');
    expect(code).toMatch(/WHERE NOT EXISTS \(SELECT 1 FROM "PerpustakaanConfig" WHERE "isActive" = true\)/);
    expect(code).toContain("'https://anantaloka.perpustakaan.co.id'");
  });

  it('tidak menyentuh tabel arsip', () => {
    expect(code).not.toMatch(/DataPerpustakaan|KategoriBuku|PeminjamanBuku/);
    expect(code).not.toMatch(/\b(DROP|DELETE|TRUNCATE)\b/i);
  });
});
