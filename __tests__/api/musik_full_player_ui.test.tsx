// @vitest-environment node
// Pemutar layar penuh ponsel (≤734px) Musik Desa: info lagu di bar menjadi tombol, lembar berisi sampul
// besar, judul/artis, progres, transport, Antrean. jsdom rusak di repo ini → markup lewat
// renderToStaticMarkup; ketuk/geser/fokus diverifikasi manual di port 3000.
import { renderToStaticMarkup } from 'react-dom/server';
import { createTheme, MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

const music = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music.state, useMusicTime: () => music.state }));
// Lebar layar tiruan: SSR useMediaQuery selalu false, jadi cabang ponsel hanya bisa diuji lewat mock.
const viewport = vi.hoisted(() => ({ phone: false }));
vi.mock('@mantine/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/hooks')>();
  return { ...actual, useMediaQuery: (query: string) => viewport.phone && query.includes('max-width: 734px') };
});

import { MusikUiProvider } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-ui.context';
import { FullPlayerSheet, fullPlayerTransition } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/FullPlayerSheet';
import { NowPlayingBar } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/NowPlayingBar';
import { PLAYER_TEXT } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/player.text';
import { REPEAT_LABEL } from '@/app/context/music/music.text';

// test-only: lagu fiktif berbentuk respons /api/desa/musik/find-many.
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'x', link });
const A: Musik = {
  id: 'a',
  judul: 'Tabuh Telu',
  artis: 'Sekaa Gong',
  deskripsi: null,
  durasi: '02:34',
  genre: null,
  tahunRilis: null,
  audioFile: file('https://example.test/a.mp3'),
  coverImage: file('https://example.test/a.jpg'),
  isActive: true,
};

const noop = () => {};
beforeEach(() => {
  viewport.phone = false;
  music.state = {
    currentSong: A,
    isPlaying: true,
    musikData: [A],
    currentTime: 8,
    duration: 154,
    volume: 70,
    isMuted: false,
    repeatMode: 'off',
    hasNext: true,
    isShuffle: false,
    upNext: [],
    recentlyPlayed: [],
    playSong: noop,
    togglePlayPause: noop,
    playNext: noop,
    playPrev: noop,
    seek: noop,
    seekPreview: noop,
    setVolume: noop,
    toggleMute: noop,
    cycleRepeat: noop,
    toggleShuffle: noop,
  };
});

// Portal Mantine baru terpasang setelah mount → di server Drawer dirender di tempat.
const theme = createTheme({ components: { DrawerRoot: { defaultProps: { withinPortal: false } } } });
const render = (node: ReactElement) =>
  renderToStaticMarkup(
    <MantineProvider theme={theme}>
      <MusikUiProvider>{node}</MusikUiProvider>
    </MantineProvider>
  ).replace(/<style[\s\S]*?<\/style>/g, '');

const sheet = (props: Partial<Parameters<typeof FullPlayerSheet>[0]> = {}) =>
  render(<FullPlayerSheet opened onClose={noop} onOpenQueue={noop} returnFocus {...props} />);

describe('info lagu di bar', () => {
  it('ponsel: tombol berlabel yang membuka dialog pemutar (tertutup saat SSR)', () => {
    viewport.phone = true;
    const html = render(<NowPlayingBar />);
    const open = html.match(/<button[^>]*aria-label="Buka pemutar: Tabuh Telu, Sekaa Gong"[^>]*>/);
    expect(open).not.toBeNull();
    expect(open![0]).toContain('aria-haspopup="dialog"');
    expect(open![0]).toContain('aria-expanded="false"');
    // Lembar tertutup: isinya belum dirender.
    expect(html).not.toContain(PLAYER_TEXT.closePlayer);
  });

  it('layar lebar: info lagu tetap teks biasa, bukan tombol', () => {
    expect(render(<NowPlayingBar />)).not.toContain(PLAYER_TEXT.openPlayer);
  });
});

describe('FullPlayerSheet', () => {
  it('dialog berisi tutup, sampul besar, judul/artis, progres, transport lengkap, dan Antrean', () => {
    const html = sheet();
    expect(html).toMatch(/role="dialog"[^>]*aria-label="Pemutar musik"|aria-label="Pemutar musik"[^>]*role="dialog"/);
    expect(html).toMatch(new RegExp(`<button[^>]*aria-label="${PLAYER_TEXT.closePlayer}"`));
    expect(html).toMatch(/<img[^>]*src="https:\/\/example.test\/a.jpg"[^>]*alt="Sampul Tabuh Telu"/);
    expect(html).toMatch(/<h2[^>]*>Tabuh Telu<\/h2>/);
    expect(html).toContain('Sekaa Gong');
    expect(html).toContain('aria-valuetext="0:08 dari 2:34"');
    for (const label of [PLAYER_TEXT.shuffle, PLAYER_TEXT.prev, PLAYER_TEXT.pause, PLAYER_TEXT.next, REPEAT_LABEL.off]) {
      expect(html, label).toMatch(new RegExp(`<button[^>]*aria-label="${label}"`));
    }
    expect(html).toMatch(/<button[^>]*>.*?<span>Antrean<\/span><\/button>/);
    expect(html).not.toContain('—');
  });

  it('token tema terang ikut di root portal; latar hanya di elemen content', () => {
    const html = sheet();
    const classOf = (marker: string) => html.match(new RegExp(`class="([^"]*${marker}[^"]*)"`))?.[1] ?? '';
    expect(classOf('mantine-Drawer-root')).toMatch(/tokens/);
    expect(classOf('mantine-Drawer-content')).toMatch(/content/);
    expect(classOf('mantine-Drawer-inner')).not.toMatch(/_content_/);
  });

  it('lagu tanpa audio: keterangan audio belum tersedia, putar nonaktif', () => {
    music.state = { ...music.state, currentSong: { ...A, audioFile: null }, isPlaying: false };
    const html = sheet();
    expect(html).toContain(PLAYER_TEXT.noAudio);
    expect(html).toMatch(new RegExp(`<button[^>]*disabled=""[^>]*aria-label="${PLAYER_TEXT.play}"|<button[^>]*aria-label="${PLAYER_TEXT.play}"[^>]*disabled`));
  });

  it('tanpa lagu: tidak dirender', () => {
    music.state = { ...music.state, currentSong: null };
    expect(sheet()).toBe('');
  });

  it('prefers-reduced-motion → transisi tanpa durasi; selain itu geser 280ms', () => {
    expect(fullPlayerTransition(true).duration).toBe(0);
    expect(fullPlayerTransition(false).duration).toBe(280);
  });
});
