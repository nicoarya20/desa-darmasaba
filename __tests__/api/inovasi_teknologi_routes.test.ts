// @vitest-environment node
// Inovasi Teknologi Desa menggantikan dua halaman: URL lama (dibagikan warga, terindeks) wajib redirect permanen,
// navbar/pencarian menunjuk rute baru yang nyata, dan migrasi data idempoten tanpa menghapus cadangan InfoTekno.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import getDetailUrl from '@/app/(public)/_com/searchUrl';
import navbarListMenu from '@/con/navbar-list-menu';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';

const NEW = '/inovasi/inovasi-teknologi-desa';

describe('redirect URL lama (next.config)', () => {
  it.each([
    ['/inovasi/desa-digital-smart-village', `${NEW}?kategori=digital`],
    ['/inovasi/desa-digital-smart-village/cmkkshcox000504l88lp54coc', `${NEW}/cmkkshcox000504l88lp54coc`],
    ['/inovasi/info-teknologi-tepat-guna', `${NEW}?kategori=tepat-guna`],
    ['/admin/inovasi/desa-digital-smart-village', '/admin/inovasi/inovasi-teknologi-desa'],
    ['/admin/inovasi/info-teknologi-tepat-guna/abc/edit', '/admin/inovasi/inovasi-teknologi-desa/abc/edit'],
  ])('%s → %s (permanent)', async (from, to) => {
    const redirects = await loadRedirects();
    expect(resolveRedirect(redirects, from)).toBe(to);
    const entry = redirects.find((r) => resolveRedirect([r], from) !== null);
    expect(entry?.permanent).toBe(true);
  });

  it.each([NEW, `${NEW}/abc`])('rute baru %s tidak ditangkap redirect dan ada page-nya', async (pathname) => {
    expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
    expect(matchesRealPage(pathname, publicRoutes())).toBe(true);
  });

  it('halaman lama sudah dihapus (redirect yang menangani)', () => {
    const routes = publicRoutes();
    expect(matchesRealPage('/inovasi/desa-digital-smart-village', routes)).toBe(false);
    expect(matchesRealPage('/inovasi/info-teknologi-tepat-guna', routes)).toBe(false);
  });
});

describe('navbar & pencarian', () => {
  const inovasi = navbarListMenu.find((m) => m.name === 'Inovasi');

  it('navbar Inovasi: satu entri Inovasi Teknologi Desa, href lama hilang', () => {
    const hrefs = inovasi?.children?.map((c) => c.href) ?? [];
    expect(hrefs.filter((h) => h === NEW)).toHaveLength(1);
    expect(hrefs.some((h) => /desa-digital|tepat-guna/.test(h ?? ''))).toBe(false);
    expect(inovasi?.children?.find((c) => c.href === NEW)?.name).toBe('Inovasi Teknologi Desa');
  });

  it('hasil pencarian tipe inovasiTeknologiDesa → detail baru', () => {
    expect(getDetailUrl({ type: 'inovasiTeknologiDesa', id: 'abc' })).toBe(`${NEW}/abc`);
  });
});

describe('migrasi 20261116120000_inovasi_teknologi_desa (statis, tanpa DB)', () => {
  const sql = readFileSync(
    path.resolve(__dirname, '../../prisma/migrations/20261116120000_inovasi_teknologi_desa/migration.sql'),
    'utf8',
  );
  const code = sql.replace(/--.*$/gm, '').replace(/\s+/g, ' ');

  it('kolom & index ber-guard idempoten, kolom NOT NULL ber-DEFAULT', () => {
    expect(code).toContain(`ADD COLUMN IF NOT EXISTS "kategori" TEXT NOT NULL DEFAULT 'digital'`);
    expect(code).toContain('CREATE INDEX IF NOT EXISTS "DesaDigital_kategori_idx"');
    expect(code).toMatch(/IF NOT EXISTS \( SELECT 1 FROM pg_constraint WHERE conname = 'DesaDigital_kategori_check'/);
    expect(code).toContain(`CHECK ("kategori" IN ('digital', 'tepat-guna'))`);
  });

  it('salin InfoTekno sebagai tepat-guna tanpa menimpa, cadangan tidak di-drop', () => {
    expect(code).toMatch(/INSERT INTO "DesaDigital" .* 'tepat-guna', .* FROM "InfoTekno" AS it ON CONFLICT \("id"\) DO NOTHING/);
    expect(code).not.toMatch(/DROP TABLE|DELETE FROM "InfoTekno"|DELETE FROM "DesaDigital"/);
  });

  it('Menu Access: ID lama dialihkan ke ID dipertahankan sebelum dihapus', () => {
    const insert = code.indexOf(`'inovasi.desa-digital-smart-village'`);
    const del = code.indexOf(`DELETE FROM "UserMenuAccess" WHERE "menuId" = 'inovasi.info-teknologi-tepat-guna'`);
    expect(insert).toBeGreaterThan(-1);
    expect(del).toBeGreaterThan(insert);
    expect(code).toMatch(/INSERT INTO "UserMenuAccess" .* ON CONFLICT DO NOTHING/);
  });

  it('MenuVisibility: href lama digabung ke href navbar baru sebelum dihapus', () => {
    const insert = code.indexOf(`'${NEW}'`);
    const del = code.lastIndexOf('DELETE FROM "MenuVisibility"');
    expect(insert).toBeGreaterThan(-1);
    expect(del).toBeGreaterThan(insert);
    expect(code).toContain('count(*) < 2 OR bool_or(mv."isVisible")');
  });
});
