// @vitest-environment node
// Kontrak redirect permanen URL lama menu "Desa" → "Pemerintahan" (next.config.ts).
// Pola dicocokkan memakai matcher bawaan Next (path-match) supaya perilaku test
// sama dengan runtime: /darmasaba/desa-anti-korupsi tidak boleh ikut ter-redirect.
import { describe, it, expect } from 'vitest';
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';
import nextConfig from '../../next.config';

type Redirect = { source: string; destination: string; permanent?: boolean };

const loadRedirects = async (): Promise<Redirect[]> => {
  if (!nextConfig.redirects) throw new Error('next.config.ts tidak punya redirects()');
  return (await nextConfig.redirects()) as Redirect[];
};

/** Kembalikan destination hasil redirect untuk pathname, atau null bila tidak ada yang cocok. */
const resolveRedirect = (redirects: Redirect[], pathname: string): string | null => {
  for (const r of redirects) {
    const params = getPathMatch(r.source, { removeUnnamedParams: true, strict: true })(pathname);
    if (params === false) continue;
    const rest = Array.isArray(params.path) ? params.path.join('/') : '';
    return r.destination
      .replace('/:path*', rest ? `/${rest}` : '')
      .replace(':id', typeof params.id === 'string' ? params.id : ':id');
  }
  return null;
};

describe('next.config redirects — desa → pemerintahan', () => {
  it('punya tepat 8 entri (desa→pemerintahan + penghargaan→prestasi), semuanya permanent', async () => {
    const redirects = await loadRedirects();
    expect(redirects.map((r) => [r.source, r.destination])).toEqual([
      ['/darmasaba/desa', '/darmasaba/pemerintahan'],
      ['/darmasaba/desa/:path*', '/darmasaba/pemerintahan/:path*'],
      ['/admin/desa', '/admin/pemerintahan'],
      ['/admin/desa/:path*', '/admin/pemerintahan/:path*'],
      ['/darmasaba/penghargaan', '/darmasaba/prestasi-desa'],
      ['/darmasaba/penghargaan/:id', '/darmasaba/prestasi-desa/:id'],
      ['/admin/pemerintahan/penghargaan', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
      ['/admin/pemerintahan/penghargaan/:path*', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
    ]);
    expect(redirects.every((r) => r.permanent === true)).toBe(true);
  });

  it.each([
    ['/darmasaba/desa', '/darmasaba/pemerintahan'],
    ['/darmasaba/desa/berita/semua', '/darmasaba/pemerintahan/berita/semua'],
    ['/darmasaba/desa/layanan', '/darmasaba/pemerintahan/layanan'],
    ['/admin/desa', '/admin/pemerintahan'],
    ['/admin/desa/berita/list-berita', '/admin/pemerintahan/berita/list-berita'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it.each([
    '/darmasaba/desa-anti-korupsi',
    '/darmasaba/desa-anti-korupsi/detail/1',
    '/darmasaba/pemerintahan/berita',
    '/admin/desa-anti-korupsi',
    '/api/desa/berita/find-many',
  ])('%s tidak ter-redirect', async (pathname) => {
    expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
  });
});

describe('next.config redirects — penghargaan digabung ke prestasi desa', () => {
  it.each([
    ['/darmasaba/penghargaan', '/darmasaba/prestasi-desa'],
    ['/darmasaba/penghargaan/cmkal9dd70002vnexhvn4j2fv', '/darmasaba/prestasi-desa/cmkal9dd70002vnexhvn4j2fv'],
    ['/admin/pemerintahan/penghargaan', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
    ['/admin/pemerintahan/penghargaan/create', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
    ['/admin/pemerintahan/penghargaan/abc/edit', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it.each(['/darmasaba/prestasi-desa', '/darmasaba/prestasi-desa/abc', '/darmasaba/penghargaan/a/b'])(
    '%s tidak ter-redirect',
    async (pathname) => {
      expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
    },
  );
});
