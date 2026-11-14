// @vitest-environment node
// Info Sekolah: ringkasan per jenjang dihapus dan jenjang jadi filter di tabel. Tautan lama (dibagikan warga,
// terindeks mesin pencari) wajib permanen ke tujuan baru, tanpa rantai, dan tidak boleh menangkap rute baru.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';

const PAGE_DIR = path.resolve(__dirname, '../../src/app/(public)/(pages)/pendidikan/info-sekolah');

describe('redirect Info Sekolah (next.config)', () => {
  it.each([
    ['/pendidikan/info-sekolah/semua/lembaga', '/pendidikan/info-sekolah/lembaga'],
    ['/pendidikan/info-sekolah/semua/siswa', '/pendidikan/info-sekolah/siswa'],
    ['/pendidikan/info-sekolah/semua/pengajar', '/pendidikan/info-sekolah/pengajar'],
    ['/pendidikan/info-sekolah/sd/lembaga', '/pendidikan/info-sekolah/lembaga?jenjang=sd'],
    ['/pendidikan/info-sekolah/smp/siswa', '/pendidikan/info-sekolah/siswa?jenjang=smp'],
    ['/pendidikan/info-sekolah/paud/pengajar', '/pendidikan/info-sekolah/pengajar?jenjang=paud'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it('semua entri permanent dan tujuannya tidak redirect lagi (tanpa rantai)', async () => {
    const redirects = await loadRedirects();
    const mine = redirects.filter((r) => r.source.startsWith('/pendidikan/info-sekolah'));
    expect(mine).toHaveLength(2);
    for (const r of mine) expect(r.permanent).toBe(true);
    for (const from of ['/pendidikan/info-sekolah/semua/lembaga', '/pendidikan/info-sekolah/sd/siswa']) {
      const to = resolveRedirect(redirects, from) as string;
      expect(resolveRedirect(redirects, to.split('?')[0])).toBeNull();
    }
  });

  it.each([
    '/pendidikan/info-sekolah',
    '/pendidikan/info-sekolah/lembaga',
    '/pendidikan/info-sekolah/siswa',
    '/pendidikan/info-sekolah/pengajar',
    '/pendidikan/info-sekolah/lainnya/rincian',
  ])('rute baru %s tidak ter-redirect', async (pathname) => {
    expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
  });
});

describe('rute Info Sekolah di file system', () => {
  const routes = publicRoutes();

  it('ringkasan dan tiga tabel punya halaman', () => {
    for (const p of ['/pendidikan/info-sekolah', '/pendidikan/info-sekolah/lembaga', '/pendidikan/info-sekolah/siswa', '/pendidikan/info-sekolah/pengajar']) {
      expect(matchesRealPage(p, routes), p).toBe(true);
    }
  });

  it('sisa rute lama (semua/, tabel per jenjang, pil) sudah dihapus; /{jenjang} satu segmen hanya redirect', () => {
    expect(existsSync(path.join(PAGE_DIR, 'semua'))).toBe(false);
    expect(existsSync(path.join(PAGE_DIR, '_lib'))).toBe(false);
    for (const f of ['content.tsx', 'lembaga', 'siswa', 'pengajar']) {
      expect(existsSync(path.join(PAGE_DIR, '[jenjangPendidikan]', f)), f).toBe(false);
    }
    expect(existsSync(path.join(PAGE_DIR, '[jenjangPendidikan]', 'page.tsx'))).toBe(true);
  });
});
