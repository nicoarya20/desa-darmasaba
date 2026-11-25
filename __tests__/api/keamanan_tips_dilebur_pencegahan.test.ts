// @vitest-environment node
// Menu Tips Keamanan dilebur ke Pencegahan Kriminalitas (2026-11-24): tidak ada lagi di navbar, alamat lama dialihkan
// ke bagian `#tips-keamanan` (kata kunci dipertahankan), dan hasil pencarian tips menuju bagian itu.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
}));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

import TipsKeamananLamaPage from '@/app/(public)/(pages)/keamanan/tips-keamanan/page';
import getDetailUrl, { isSearchResultHidden } from '@/app/(public)/_com/searchUrl';
import navbarListMenu from '@/con/navbar-list-menu';

const keamanan = navbarListMenu.find((menu) => menu.name === 'Keamanan');
const tipsHasilCari = { type: 'tipsKeamanan', id: 't1', name: 'Keamanan Rumah' }; // test-only

beforeEach(() => {
  redirectMock.mockClear();
});

describe('navbar Keamanan', () => {
  it('submenu Tips Keamanan dihapus (bukan disembunyikan: submenu tersembunyi menjadi 404 dan mematikan redirect)', () => {
    const hrefs = (keamanan?.children ?? []).map((child) => child.href);
    expect(hrefs).toContain('/keamanan/pencegahan-kriminalitas');
    expect(hrefs).not.toContain('/keamanan/tips-keamanan');
  });
});

describe('alamat lama /keamanan/tips-keamanan', () => {
  it('dialihkan ke bagian tips di Pencegahan Kriminalitas', async () => {
    await expect(TipsKeamananLamaPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith('/keamanan/pencegahan-kriminalitas#tips-keamanan');
  });

  it('kata kunci ?search= dipertahankan; nilai ganda diabaikan', async () => {
    await expect(TipsKeamananLamaPage({ searchParams: Promise.resolve({ search: 'rumah' }) })).rejects.toThrow();
    expect(redirectMock).toHaveBeenLastCalledWith('/keamanan/pencegahan-kriminalitas?search=rumah#tips-keamanan');
    await expect(TipsKeamananLamaPage({ searchParams: Promise.resolve({ search: ['a', 'b'] }) })).rejects.toThrow();
    expect(redirectMock).toHaveBeenLastCalledWith('/keamanan/pencegahan-kriminalitas#tips-keamanan');
  });
});

describe('pencarian global: hasil tips keamanan', () => {
  it('menuju bagian tips di halaman Pencegahan Kriminalitas', () => {
    expect(getDetailUrl(tipsHasilCari)).toBe('/keamanan/pencegahan-kriminalitas#tips-keamanan');
  });

  it('ikut tersembunyi bila menu Pencegahan Kriminalitas disembunyikan admin (bagian #… diabaikan)', () => {
    expect(isSearchResultHidden(tipsHasilCari, ['/keamanan/pencegahan-kriminalitas'])).toBe(true);
    expect(isSearchResultHidden(tipsHasilCari, ['/keamanan/cctv'])).toBe(false);
  });
});
