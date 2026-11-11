// @vitest-environment node
// Website publik pindah dari /darmasaba/* ke root (route group src/app/(public)). Link lama
// berprefix wajib 301/308 ke versi tanpa prefix, dan redirect lama (desa, penghargaan) langsung
// ke tujuan final tanpa rantai. Path non-publik (/admin, /api, /_next, aset) tidak boleh tertangkap.
import { describe, it, expect } from 'vitest';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';

describe('redirect prefix /darmasaba → root', () => {
  it('/darmasaba → / dan /darmasaba/:path* → /:path* bersifat permanent', async () => {
    const redirects = await loadRedirects();
    expect(redirects).toContainEqual({ source: '/darmasaba', destination: '/', permanent: true });
    expect(redirects).toContainEqual({ source: '/darmasaba/:path*', destination: '/:path*', permanent: true });
  });

  it.each([
    ['/darmasaba', '/'],
    ['/darmasaba/ppid/profil-ppid', '/ppid/profil-ppid'],
    ['/darmasaba/pemerintahan/berita/semua', '/pemerintahan/berita/semua'],
    ['/darmasaba/kesehatan/puskesmas/abc123', '/kesehatan/puskesmas/abc123'],
    ['/darmasaba/desa-anti-korupsi', '/desa-anti-korupsi'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it.each([
    ['/darmasaba/desa', '/pemerintahan'],
    ['/darmasaba/desa/berita/semua', '/pemerintahan/berita/semua'],
    ['/darmasaba/penghargaan', '/prestasi-desa'],
    ['/darmasaba/penghargaan/cmkal9dd70002vnexhvn4j2fv', '/prestasi-desa/cmkal9dd70002vnexhvn4j2fv'],
  ])('redirect lama %s langsung ke tujuan final %s (tanpa rantai)', async (from, to) => {
    const redirects = await loadRedirects();
    const first = resolveRedirect(redirects, from);
    expect(first).toBe(to);
    expect(resolveRedirect(redirects, first as string)).toBeNull();
  });

  it('wildcard /darmasaba/:path* ada SETELAH semua entri /darmasaba spesifik', async () => {
    const sources = (await loadRedirects()).map((r) => r.source);
    const wildcard = sources.indexOf('/darmasaba/:path*');
    const specific = sources.filter((s) => s.startsWith('/darmasaba/') && s !== '/darmasaba/:path*');
    expect(specific.length).toBeGreaterThan(0);
    for (const s of specific) expect(sources.indexOf(s)).toBeLessThan(wildcard);
  });

  it.each([
    '/',
    '/ppid/profil-ppid',
    '/admin',
    '/admin/pemerintahan/berita/list-berita',
    '/api/desa/berita/find-many',
    '/_next/static/chunks/main.js',
    '/darmasaba-icon.png',
    '/assets/images/darmasaba-icon.png',
    '/api/img/darmasaba.jpeg',
  ])('%s tidak ter-redirect', async (pathname) => {
    expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
  });
});
