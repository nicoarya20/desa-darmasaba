// @vitest-environment node
// Berkas statis public/ harus ber-cache 30 hari (audit PageSpeed "Use efficient cache lifetimes") tanpa menyentuh
// /api, /_next, atau /admin. Pola source dicocokkan dengan path-to-regexp bawaan Next (yang dipakai saat runtime).
import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- modul compiled Next tanpa types; sama dengan yang dipakai Next untuk mencocokkan source headers()
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
  pathToRegexp: (path: string, keys: unknown[], opts: { delimiter: string; sensitive: boolean; strict: boolean }) => RegExp;
};
import nextConfig from '../../next.config';
import { SECURITY_HEADERS } from '../../src/lib/security-headers';
import { STATIC_CACHE_CONTROL } from '../../src/lib/static-cache-headers';

type Rule = { source: string; headers: { key: string; value: string }[] };

const rules = (await nextConfig.headers!()) as Rule[];
const matcher = (source: string) => pathToRegexp(source, [], { delimiter: '/', sensitive: false, strict: true });
const cacheRules = rules.filter((r) => r.headers.some((h) => h.key === 'Cache-Control'));
const cacheHeaderFor = (url: string) =>
  cacheRules.filter((r) => matcher(r.source).test(url)).flatMap((r) => r.headers).find((h) => h.key === 'Cache-Control')?.value;

describe('headers() di next.config.ts', () => {
  it('memakai max-age 30 hari + stale-while-revalidate 1 hari, bukan immutable', () => {
    expect(STATIC_CACHE_CONTROL).toBe('public, max-age=2592000, stale-while-revalidate=86400');
    expect(STATIC_CACHE_CONTROL).not.toContain('immutable');
  });

  it('/assets/:path* dan pola berkas akar sama-sama memakai max-age=2592000', () => {
    expect(cacheRules.map((r) => r.source)).toContain('/assets/:path*');
    expect(cacheRules).toHaveLength(2);
    for (const r of cacheRules) {
      expect(r.headers).toEqual([{ key: 'Cache-Control', value: STATIC_CACHE_CONTROL }]);
      expect(r.headers[0].value).toContain('max-age=2592000');
    }
  });

  it('header keamanan tetap dipasang untuk /:path* dan berada paling awal', () => {
    expect(rules[0]).toEqual({ source: '/:path*', headers: SECURITY_HEADERS });
    expect(SECURITY_HEADERS.length).toBeGreaterThan(0);
  });

  it.each(['/assets/fonts/font.otf', '/assets/images/darmasaba-icon.png', '/assets/videos/award.mp4', '/darmasaba-icon.png', '/pudak-icon.png', '/mangupuraaward.jpeg', '/default-avatar.svg'])(
    'berkas statis %s mendapat cache 30 hari',
    (url) => {
      expect(cacheHeaderFor(url)).toBe(STATIC_CACHE_CONTROL);
    },
  );

  it.each(['/api/img/x.webp', '/api/x.png', '/_next/static/a.js', '/_next/static/media/f.woff2', '/admin/x.png', '/admin/a/b.png', '/a/b.png', '/manifest.json', '/assetsx/a.png'])(
    '%s tidak terkena aturan cache statis',
    (url) => {
      expect(cacheHeaderFor(url)).toBeUndefined();
    },
  );

  it('tidak ada aturan cache yang sumbernya diawali /api, /_next, atau /admin', () => {
    for (const r of cacheRules) expect(r.source).not.toMatch(/^\/(api|_next|admin)(\/|$)/);
  });
});
