// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createLimiter } from '@/lib/rate-limit';
import { otpSendLimiter, otpVerifyLimiter } from '@/app/api/auth/_lib/rateLimiter';

describe('createLimiter', () => {
  it('sliding window: remaining menurun, blok dengan retryAfter dari timestamp tertua', () => {
    const l = createLimiter(3, 1000);
    expect(l.check('k', undefined, 0)).toEqual({ allowed: true, retryAfterMs: 0, remaining: 2 });
    expect(l.check('k', undefined, 100).remaining).toBe(1);
    expect(l.check('k', undefined, 200).remaining).toBe(0);
    expect(l.check('k', undefined, 300)).toEqual({ allowed: false, retryAfterMs: 700, remaining: 0 });
    expect(l.check('k', undefined, 1001).allowed).toBe(true);
  });

  it('percobaan yang diblok tidak memakan slot', () => {
    const l = createLimiter(1, 1000);
    l.check('k', undefined, 0);
    for (let t = 100; t < 1000; t += 100) expect(l.check('k', undefined, t).allowed).toBe(false);
    expect(l.check('k', undefined, 1000).allowed).toBe(true);
  });

  it('max per panggilan menimpa default; kunci terpisah', () => {
    const l = createLimiter(10, 1000);
    expect(l.check('a', 2, 0).remaining).toBe(1);
    expect(l.check('a', 2, 1).remaining).toBe(0);
    expect(l.check('a', 2, 2).allowed).toBe(false);
    expect(l.check('a', 5, 3)).toEqual({ allowed: true, retryAfterMs: 0, remaining: 2 });
    expect(l.check('b', 2, 4).allowed).toBe(true);
  });

  it('max 0 selalu memblok dengan retryAfter = window', () => {
    expect(createLimiter(5, 1000).check('k', 0, 0)).toEqual({ allowed: false, retryAfterMs: 1000, remaining: 0 });
  });

  it('reset dan sweep membersihkan kunci', () => {
    const l = createLimiter(3, 1000);
    l.check('a', undefined, 0);
    l.check('b', undefined, 900);
    expect(l.size).toBe(2);
    l.reset('a');
    expect(l.size).toBe(1);
    l.check('a', undefined, 0);
    l.sweep(1500);
    expect(l.size).toBe(1);
    l.sweep(2000);
    expect(l.size).toBe(0);
  });

  it('satu timer pembersih global (tidak bertambah per limiter)', () => {
    createLimiter(1, 1000);
    const timer = (globalThis as { __rateLimitSweeper?: { timer?: unknown } }).__rateLimitSweeper?.timer;
    expect(timer).toBeDefined();
    createLimiter(1, 1000);
    expect((globalThis as { __rateLimitSweeper?: { timer?: unknown } }).__rateLimitSweeper?.timer).toBe(timer);
  });
});

describe('limiter OTP (perilaku tidak berubah)', () => {
  it('kirim OTP: 3 per 10 menit', () => {
    const key = `otp-send-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(otpSendLimiter.check(key).allowed).toBe(true);
    const blocked = otpSendLimiter.check(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(9 * 60 * 1000);
    otpSendLimiter.reset(key);
  });

  it('verifikasi OTP: 5 per 15 menit', () => {
    const key = `otp-verify-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(otpVerifyLimiter.check(key).allowed).toBe(true);
    expect(otpVerifyLimiter.check(key).allowed).toBe(false);
    otpVerifyLimiter.reset(key);
  });
});
