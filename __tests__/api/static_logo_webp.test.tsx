// @vitest-environment node
// Lambang desa, logo Pudak, dan poster hero Prestasi di situs publik memakai WebP seukuran tampil (bukan PNG/JPEG
// asli 101/48/182 KB yang dimuat dengan prioritas tinggi). Menjaga: path menunjuk berkas WebP yang benar-benar ada,
// dan navbar serta logo splash/transisi tema tidak kembali ke PNG lama. Markup diuji via renderToStaticMarkup
// (jsdom rusak di repo ini).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
// Panel pencarian (GlobalSearch + fetch) tidak relevan untuk logo; diganti stub.
vi.mock('@/app/(public)/_com/NavBarSearch', () => ({ NavbarSearch: () => null }));
// Navbar ponsel membaca useMusic() (penanda & kartu pemutar); tanpa lagu keduanya tidak dirender.
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => ({ currentSong: null, isPlaying: false }) }));

import {
  LOGO_DESA_LARGE_SRC,
  LOGO_DESA_SMALL_SRC,
  LOGO_PUDAK_SMALL_SRC,
} from '@/app/(public)/_com/logo-desa.meta';
import { NavbarMainMenu } from '@/app/(public)/_com/NavbarMainMenu';
import { NavbarMobile } from '@/app/(public)/_com/NavbarMobile';
import { PRESTASI_HERO_VIDEO } from '@/app/(public)/_com/main-page/prestasi/prestasi.meta';
import { LOGO_DESA_SRC } from '@/app/(public)/(pages)/pemerintahan/profil/_com/profil.meta';
import GateSplash from '@/app/(public)/_com/splash/GateSplash';
import ThemeGateTransition from '@/app/(public)/_com/theme-transition/ThemeGateTransition';

const PUBLIC_DIR = path.resolve(__dirname, '../../public');

/** Berkas WebP diawali "RIFF" (4 byte), panjang (4 byte), lalu "WEBP". */
function isWebpFile(urlPath: string): boolean {
  const head = readFileSync(path.join(PUBLIC_DIR, urlPath)).subarray(0, 12);
  return head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP';
}

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('aset WebP situs publik', () => {
  it.each([
    ['logo desa kecil', LOGO_DESA_SMALL_SRC],
    ['logo desa besar', LOGO_DESA_LARGE_SRC],
    ['logo Pudak kecil', LOGO_PUDAK_SMALL_SRC],
    ['poster hero Prestasi', PRESTASI_HERO_VIDEO.poster],
  ])('%s menunjuk berkas WebP yang ada di public/', (_label, src) => {
    expect(src).toMatch(/^\/assets\/images\/[\w-]+\.webp$/);
    expect(isWebpFile(src)).toBe(true);
  });

  it('kartu Lambang Desa di Profil memakai logo desa besar yang sama dengan PPID', () => {
    expect(LOGO_DESA_SRC).toBe(LOGO_DESA_LARGE_SRC);
  });
});

describe('logo navbar', () => {
  it.each([
    ['desktop', () => <NavbarMainMenu listNavbar={[]} />],
    ['ponsel', () => <NavbarMobile listNavbar={[]} />],
  ])('%s memakai logo desa WebP kecil, bukan PNG lama', (_label, el) => {
    const html = render(el());
    expect(html).toContain(`src="${LOGO_DESA_SMALL_SRC}"`);
    expect(html).not.toContain('darmasaba-icon.png');
  });
});

// <link rel="preload"> sengaja TIDAK dibuang: React 19 mem-preload <img> logo, dan justru preload PNG 101 KB
// itu yang bersaing dengan CSS & foto LCP beranda.
describe('logo splash & transisi tema', () => {
  it.each([
    ['splash gerbang beranda', () => <GateSplash />],
    ['overlay transisi tema', () => <ThemeGateTransition />],
  ])('%s memakai logo desa WebP besar, bukan PNG lama', (_label, el) => {
    const html = render(el());
    expect(html).toContain(`src="${LOGO_DESA_LARGE_SRC}"`);
    expect(html).not.toContain('darmasaba-icon.png');
  });
});
