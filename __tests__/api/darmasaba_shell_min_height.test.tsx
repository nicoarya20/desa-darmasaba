// @vitest-environment node
// Juknis lomba 5.4 (kecepatan, CLS): konten shell publik punya tinggi minimum = sisa layar di bawah navbar,
// supaya footer tidak sempat tampil lalu terdorong saat data halaman (fetch klien) tiba.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/pemerintahan/berita/semua';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/app/(public)/_com/Navbar', () => ({ Navbar: () => <nav /> }));
vi.mock('@/app/(public)/_com/Footer', () => ({ default: () => <footer data-test="footer" /> }));
vi.mock('@/app/(public)/_com/FixedPlayerBar', () => ({ default: () => null }));
vi.mock('@/app/(public)/_com/ImageErrorRetryMount', () => ({ ImageErrorRetry: () => null }));
import { DarmasabaShell } from '@/app/(public)/_com/DarmasabaShell';

const render = () =>
  renderToStaticMarkup(
    <MantineProvider>
      <DarmasabaShell>
        <main data-test="konten" />
      </DarmasabaShell>
    </MantineProvider>,
  );

/** Aturan CSS min-height berbasis layar (100svh) yang dihasilkan Mantine; `Space` navbar juga memakai min-height, jadi disaring. */
const minHeightRules = (html: string) => (html.match(/min-height:[^;}]*/g) ?? []).filter((r) => r.includes('100svh'));

describe('DarmasabaShell — tinggi minimum konten', () => {
  beforeEach(() => {
    pathname = '/pemerintahan/berita/semua';
  });

  it('halaman biasa: min-height = 100svh dikurangi tinggi navbar (ponsel 3rem, desktop 2.75rem)', () => {
    const rules = minHeightRules(render());
    expect(rules).toContain('min-height:calc(100svh - 3rem)');
    expect(rules).toContain('min-height:calc(100svh - 2.75rem)');
  });

  it('aplikasi Musik Desa: tanpa tinggi minimum dan tanpa footer situs', () => {
    pathname = '/musik/musik-desa/jelajahi';
    const html = render();
    expect(minHeightRules(html)).toEqual([]);
    expect(html).not.toContain('data-test="footer"');
  });
});

/** Atribut style div pembungkus langsung `<main data-test="konten">` (kotak konten shell). */
const contentBoxStyle = (html: string) => html.match(/<div style="([^"]*)"[^>]*><main data-test="konten"/)?.[1] ?? null;

describe('DarmasabaShell — latar kotak konten', () => {
  beforeEach(() => {
    pathname = '/kesehatan/puskesmas';
  });

  // Halaman yang lebih pendek dari tinggi minimum dulu memperlihatkan latar --c-page shell (abu) sebagai pita
  // kosong di atas footer; kotak konten kini melukis latar section --c-bg sendiri.
  it('kotak konten berlatar --c-bg, shell tetap --c-page', () => {
    const html = render();
    expect(contentBoxStyle(html)).toContain('background:var(--c-bg)');
    expect(html).toMatch(/<div style="[^"]*background:var\(--c-page\)"[^>]*class="[^"]*mantine-Stack-root/);
  });

  it('aplikasi Musik Desa: kotak konten juga --c-bg (sama dengan --m-bg aplikasi)', () => {
    pathname = '/musik/musik-desa/jelajahi';
    expect(contentBoxStyle(render())).toContain('background:var(--c-bg)');
  });
});
