// @vitest-environment node
// Navbar ponsel saat ada lagu: tombol equalizer putar/jeda di bar (sebelum burger) dan kartu Now Playing di bawah
// menu utama panel. Tanpa lagu keduanya tidak dirender. Markup via renderToStaticMarkup (jsdom rusak di repo ini);
// ketuk equalizer & drill-down submenu (kartu hilang di level submenu) diverifikasi manual di browser.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import type { Musik } from '@/app/context/MusicContext';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
const music = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music.state, useMusicTime: () => music.state }));
// Kartu asli tetap dirender; props terakhirnya dicatat supaya sambungan onStop (fokus ke burger) bisa dicek.
const card = vi.hoisted(() => ({ props: null as null | Record<string, unknown> }));
vi.mock('@/app/(public)/_com/now-playing/NowPlayingCard', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/app/(public)/_com/now-playing/NowPlayingCard')>();
  return {
    NowPlayingCard: (props: Parameters<typeof mod.NowPlayingCard>[0]) => {
      card.props = props;
      return mod.NowPlayingCard(props);
    },
  };
});

import { NavbarMobile } from '@/app/(public)/_com/NavbarMobile';
import { musicToggleLabel, NavbarMenuPlayer } from '@/app/(public)/_com/NavbarMobileMusic';
import type { MenuItem } from '../../types/menu-item';

// test-only: lagu & menu fiktif.
const SONG: Musik = {
  id: 'a',
  judul: 'Tari Pendet',
  artis: 'Sekaa Gong',
  deskripsi: null,
  durasi: '03:00',
  genre: null,
  tahunRilis: null,
  audioFile: { id: 'f', name: 'f', realName: 'f', path: 'f', mimeType: 'audio/mpeg', link: 'https://example.test/a.mp3' },
  coverImage: null,
  isActive: true,
};
const MENU: MenuItem[] = [
  { id: '1', name: 'Beranda', href: '/' },
  { id: '2', name: 'DAK', children: [{ id: '2.1', name: 'Desa Anti Korupsi', href: '/desa-anti-korupsi' }] },
];

const noop = () => {};
const setMusic = (over: Record<string, unknown> = {}) => {
  music.state = {
    currentSong: SONG,
    isPlaying: true,
    hasNext: true,
    currentTime: 8,
    duration: 154,
    togglePlayPause: noop,
    playPrev: noop,
    playNext: noop,
    stop: noop,
    seek: noop,
    seekPreview: noop,
    ...over,
  };
};

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = () =>
  renderToStaticMarkup(
    <MantineProvider>
      <NavbarMobile listNavbar={MENU} />
    </MantineProvider>
  ).replace(/<style[\s\S]*?<\/style>/g, '');

const PLAYER_REGION = 'aria-label="Sedang diputar"';

beforeEach(() => {
  setMusic();
  card.props = null;
});

describe('musicToggleLabel', () => {
  it('"Jeda musik" saat diputar, "Putar musik" saat dijeda', () => {
    expect(musicToggleLabel(true)).toBe('Jeda musik');
    expect(musicToggleLabel(false)).toBe('Putar musik');
  });
});

describe('navbar ponsel tanpa lagu', () => {
  it('tanpa tombol equalizer dan tanpa kartu pemutar', () => {
    setMusic({ currentSong: null, isPlaying: false });
    const html = render();
    expect(html).not.toMatch(/aria-label="(Jeda|Putar) musik"/);
    expect(html).not.toContain(PLAYER_REGION);
    expect(html).toContain('aria-label="Buka menu"');
  });
});

describe('navbar ponsel dengan lagu', () => {
  it('tombol equalizer "Jeda musik" (bergerak) tepat sebelum burger', () => {
    const html = render();
    const toggle = html.indexOf('aria-label="Jeda musik"');
    expect(toggle).toBeGreaterThan(-1);
    expect(toggle).toBeLessThan(html.indexOf('aria-label="Buka menu"'));
    expect(html).toMatch(/aria-label="Jeda musik"[^>]*data-playing="true"[^>]*>\s*<span[^>]*data-playing="true"/);
  });

  it('dijeda: label "Putar musik" dan equalizer diam', () => {
    setMusic({ isPlaying: false });
    const html = render();
    expect(html).toContain('aria-label="Putar musik"');
    expect(html).not.toContain('aria-label="Jeda musik"');
    expect(html).toMatch(/aria-label="Putar musik"[^>]*data-playing="false"/);
  });

  it('kartu varian menu di dalam panel, setelah daftar menu utama', () => {
    const html = render();
    const panel = html.indexOf('id="darmasaba-nav-mobile"');
    const listEnd = html.indexOf('</ul>', panel);
    const cardAt = html.indexOf(PLAYER_REGION);
    expect(panel).toBeGreaterThan(-1);
    expect(cardAt).toBeGreaterThan(listEnd);
    expect(html).toContain('data-variant="menu"');
    expect(html).toContain('Tari Pendet');
  });
});

describe('× di kartu menu: fokus pindah ke burger', () => {
  it('NavbarMenuPlayer meneruskan onStop ke kartu; NavbarMobile selalu memasangnya', () => {
    const onStop = vi.fn();
    renderToStaticMarkup(
      <MantineProvider>
        <NavbarMenuPlayer onNavigate={noop} onStop={onStop} revealIndex={0} />
      </MantineProvider>
    );
    expect(card.props?.onStop).toBe(onStop);

    render();
    expect(card.props?.variant).toBe('menu');
    expect(card.props?.onStop).toEqual(expect.any(Function));
    // Di server ref burger kosong: pemanggilan aman (fokus sungguhan diverifikasi di browser).
    expect(() => (card.props?.onStop as () => void)()).not.toThrow();
  });
});
