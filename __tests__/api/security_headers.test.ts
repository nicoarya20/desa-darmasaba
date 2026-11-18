// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS } from '../../src/lib/security-headers';

const headerValue = (key: string) => SECURITY_HEADERS.find((h) => h.key === key)?.value;

describe('SECURITY_HEADERS', () => {
  it('memuat tepat 6 header dengan nilai persis sesuai juknis 8.5', () => {
    expect(Object.fromEntries(SECURITY_HEADERS.map((h) => [h.key, h.value]))).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=15552000',
      'Content-Security-Policy': "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
    });
    expect(SECURITY_HEADERS).toHaveLength(6);
  });

  it('tidak ada key header ganda', () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('HSTS tanpa includeSubDomains dan preload', () => {
    const hsts = headerValue('Strict-Transport-Security') ?? '';
    expect(hsts).toMatch(/^max-age=\d+$/);
    expect(hsts).not.toMatch(/includeSubDomains/i);
    expect(hsts).not.toMatch(/preload/i);
  });

  it('CSP longgar: tanpa script-src, default-src, img-src, frame-src, style-src, form-action', () => {
    const csp = headerValue('Content-Security-Policy') ?? '';
    for (const directive of ['script-src', 'default-src', 'img-src', 'frame-src', 'style-src', 'form-action']) {
      expect(csp).not.toContain(directive);
    }
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it('Permissions-Policy mengizinkan mikrofon untuk origin sendiri (Jenna voice)', () => {
    const policy = headerValue('Permissions-Policy') ?? '';
    expect(policy).toContain('microphone=(self)');
    expect(policy).toContain('camera=()');
    expect(policy).toContain('geolocation=()');
  });

  it('X-Frame-Options SAMEORIGIN agar PDF di iframe tetap tampil', () => {
    expect(headerValue('X-Frame-Options')).toBe('SAMEORIGIN');
  });
});
