// @vitest-environment node
// Kontrak matcher guard route (src/proxy.ts): path mana yang WAJIB lewat proxy.
// Matcher berubah diam-diam = /admin bisa lolos tanpa guard, jadi dikunci di sini.
// `config` diimpor langsung dari proxy.ts (bukan disalin) supaya test ikut file aslinya.
import { describe, it, expect } from 'vitest';
// TODO(next16): next 16.4.5 belum ekspor unstable_doesProxyMatch (docs proxy.mdx sudah menyebutnya); ganti saat tersedia di versi terpasang.
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '@/proxy';

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe('proxy matcher — path yang dijaga', () => {
  it.each([
    '/admin',
    '/admin/x/y',
    '/admin/landing-page/profil/program-inovasi',
    '/validasi',
    '/waiting-room',
  ])('%s → proxy jalan', (url) => {
    expect(matches(url)).toBe(true);
  });
});

describe('proxy matcher — path publik tidak disentuh', () => {
  it.each([
    '/',
    '/darmasaba',
    '/darmasaba/pemerintahan/layanan',
    '/login',
    '/profile',
    '/api/auth/get-session',
    '/api/fileStorage/findUnique/x',
    '/administrasi', // prefix mirip "/admin" tapi bukan segmen /admin
  ])('%s → proxy tidak jalan', (url) => {
    expect(matches(url)).toBe(false);
  });
});
