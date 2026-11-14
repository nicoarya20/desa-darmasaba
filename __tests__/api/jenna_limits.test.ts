// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({ env: { BETTER_AUTH_SECRET: 'test-secret' } }));

import {
  checkInput,
  getClientIp,
  hashIdentifier,
  hashJennaIdentifier,
  INPUT_MESSAGES,
  jennaGlobalMinuteLimiter,
  JENNA_GLOBAL_PER_MINUTE,
  secondsUntilJakartaMidnight,
  startOfJakartaDay,
} from '@/lib/jenna/limits';

describe('checkInput', () => {
  it('kosong / spasi / hanya karakter kontrol → empty', () => {
    for (const t of ['', '   ', '​‮', '\n\n']) {
      expect(checkInput(t, 100)).toEqual({ ok: false, reason: 'empty', message: INPUT_MESSAGES.empty });
    }
  });

  it('karakter kontrol/format dibuang, baris baru dipertahankan, lalu di-trim', () => {
    expect(checkInput('  ha\u0000lo​\nbaris‮  ', 100)).toEqual({ ok: true, text: 'halo\nbaris' });
  });

  it('panjang dihitung setelah dibersihkan; batas inklusif', () => {
    expect(checkInput('a'.repeat(10), 10)).toEqual({ ok: true, text: 'a'.repeat(10) });
    expect(checkInput(`  ${'a'.repeat(10)}​ `, 10).ok).toBe(true);
    expect(checkInput('a'.repeat(11), 10)).toEqual({ ok: false, reason: 'too_long', message: INPUT_MESSAGES.too_long(10) });
  });
});

describe('hari Asia/Jakarta', () => {
  it('batas hari pada 17:00 UTC', () => {
    expect(startOfJakartaDay(new Date('2026-11-13T16:59:59.999Z')).toISOString()).toBe('2026-11-12T17:00:00.000Z');
    expect(startOfJakartaDay(new Date('2026-11-13T17:00:00.000Z')).toISOString()).toBe('2026-11-13T17:00:00.000Z');
    expect(startOfJakartaDay(new Date('2026-11-13T00:00:00.000Z')).toISOString()).toBe('2026-11-12T17:00:00.000Z');
  });

  it('detik sampai tengah malam WIB, minimal 1', () => {
    expect(secondsUntilJakartaMidnight(new Date('2026-11-13T16:00:00.000Z'))).toBe(3600);
    expect(secondsUntilJakartaMidnight(new Date('2026-11-13T16:59:59.999Z'))).toBe(1);
    expect(secondsUntilJakartaMidnight(new Date('2026-11-13T17:00:00.000Z'))).toBe(86400);
  });
});

describe('getClientIp', () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it('urutan: cf-connecting-ip → x-real-ip → hop paling kanan x-forwarded-for → null', () => {
    const all = { 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '9.9.9.9, 3.3.3.3' };
    expect(getClientIp(h(all))).toBe('1.1.1.1');
    expect(getClientIp(h({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '9.9.9.9, 3.3.3.3' }))).toBe('2.2.2.2');
    expect(getClientIp(h({ 'x-forwarded-for': '9.9.9.9, 3.3.3.3 ' }))).toBe('3.3.3.3');
    expect(getClientIp(h({ 'x-forwarded-for': '2001:db8::1' }))).toBe('2001:db8::1');
    expect(getClientIp(h({}))).toBeNull();
  });

  it('nilai bukan IP dilewati ke sumber berikutnya', () => {
    expect(getClientIp(h({ 'cf-connecting-ip': 'evil<script>', 'x-real-ip': '2.2.2.2' }))).toBe('2.2.2.2');
    expect(getClientIp(h({ 'x-real-ip': '', 'x-forwarded-for': '4.4.4.4' }))).toBe('4.4.4.4');
    expect(getClientIp(h({ 'x-forwarded-for': '4.4.4.4, unknown' }))).toBeNull();
  });
});

describe('hash identitas', () => {
  it('deterministik, hex 64, bergantung salt, nilai asli tidak terlihat', () => {
    const a = hashIdentifier('1.2.3.4', 's1');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIdentifier('1.2.3.4', 's1')).toBe(a);
    expect(hashIdentifier('1.2.3.4', 's2')).not.toBe(a);
    expect(a).not.toContain('1.2.3.4');
  });

  it('hashJennaIdentifier memakai salt ber-domain dari BETTER_AUTH_SECRET', () => {
    expect(hashJennaIdentifier('1.2.3.4')).toBe(hashIdentifier('1.2.3.4', 'jenna-identifier:test-secret'));
    expect(hashJennaIdentifier('1.2.3.4')).not.toBe(hashIdentifier('1.2.3.4', 'test-secret'));
  });
});

describe('limiter Jenna', () => {
  it('plafon global 60/menit', () => {
    expect(JENNA_GLOBAL_PER_MINUTE).toBe(60);
    const now = 1_000_000;
    for (let i = 0; i < 60; i++) expect(jennaGlobalMinuteLimiter.check('g', undefined, now).allowed).toBe(true);
    expect(jennaGlobalMinuteLimiter.check('g', undefined, now).allowed).toBe(false);
    jennaGlobalMinuteLimiter.reset('g');
  });
});
