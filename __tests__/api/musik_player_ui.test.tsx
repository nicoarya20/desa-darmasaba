// @vitest-environment node
// Bar pemutar bawah & panel Antrean Musik Desa. jsdom rusak di repo ini, jadi markup diuji lewat
// renderToStaticMarkup; useMusic diganti state tiruan supaya keadaan pemutar bisa diatur per test.
// Interaksi (klik tab, seret slider) tidak bisa dites di sini: verifikasi manual di port 3000.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

const music = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music.state }));

import { MusikUiProvider } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-ui.context';
import { NowPlayingBar } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/NowPlayingBar';
import { QueuePanel } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/QueuePanel';
import { PLAYER_TEXT } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/player.text';

// test-only: lagu fiktif berbentuk respons /api/desa/musik/find-many.
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'x', link });
const song = (id: string, judul: string, extra: Partial<Musik> = {}): Musik => ({
  id,
  judul,
  artis: `Artis ${id}`,
  deskripsi: null,
  durasi: '04:10',
  genre: 'Gamelan Tradisional',
  tahunRilis: 2024,
  audioFile: file(`https://example.test/${id}.mp3`),
  coverImage: file(`https://example.test/${id}.jpg`),
  isActive: true,
  ...extra,
});

const A = song('a', 'Tabuh Telu');
const B = song('b', 'Gending Sore', { audioFile: null });
const C = song('c', 'Pop Darmasaba', { genre: null, tahunRilis: null });

const noop = () => {};
function setMusic(overrides: Record<string, unknown> = {}) {
  music.state = {
    isPlaying: false,
    currentSong: null,
    musikData: [A, B, C],
    currentTime: 0,
    duration: 0,
    volume: 70,
    isMuted: false,
    isRepeat: false,
    isShuffle: false,
    upNext: [A, B, C],
    recentlyPlayed: [],
    playSong: noop,
    togglePlayPause: noop,
    playNext: noop,
    playPrev: noop,
    seek: noop,
    seekPreview: noop,
    setVolume: noop,
    toggleMute: noop,
    toggleRepeat: noop,
    toggleShuffle: noop,
    ...overrides,
  };
}

const render = (node: ReactElement) =>
  renderToStaticMarkup(
    <MantineProvider>
      <MusikUiProvider>{node}</MusikUiProvider>
    </MantineProvider>
  ).replace(/<style[\s\S]*?<\/style>/g, '');

const button = (html: string, label: string) => {
  const match = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`));
  expect(match, `tombol "${label}"`).not.toBeNull();
  return match![0];
};

beforeEach(() => setMusic());

describe('NowPlayingBar', () => {
  it('tanpa lagu: bar tidak dirender sama sekali (muncul setelah lagu pertama dipilih)', () => {
    expect(render(<NowPlayingBar />)).toBe('');
  });

  it('lagu dijeda tetap menampilkan bar dengan tombol Putar aktif', () => {
    setMusic({ currentSong: A, isPlaying: false });
    const html = render(<NowPlayingBar />);
    expect(html).toContain(`aria-label="${PLAYER_TEXT.barLabel}"`);
    expect(html).toContain('Tabuh Telu');
    expect(button(html, PLAYER_TEXT.play)).not.toContain('disabled');
  });

  it('memakai aria-label Indonesia dan tidak punya tombol Preview, suka, atau lainnya', () => {
    setMusic({ currentSong: A, isPlaying: true, duration: 250, currentTime: 65 });
    const html = render(<NowPlayingBar />);
    const labels = new Set([...html.matchAll(/<button[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]));
    // Jeda & Lagu berikutnya muncul dua kali (versi ponsel disembunyikan CSS), jadi dibandingkan sebagai himpunan.
    expect([...labels].sort()).toEqual(
      [
        PLAYER_TEXT.pause,
        PLAYER_TEXT.prev,
        PLAYER_TEXT.next,
        PLAYER_TEXT.shuffle,
        PLAYER_TEXT.repeat,
        PLAYER_TEXT.queue,
        PLAYER_TEXT.mute,
      ].sort()
    );
    expect(html).not.toMatch(/>\s*Preview\s*</i);
    expect(html).not.toContain('—');
  });

  it('lagu diputar: judul, artis, genre · tahun, waktu, dan latar sampul blur', () => {
    setMusic({ currentSong: A, isPlaying: true, duration: 250, currentTime: 65 });
    const html = render(<NowPlayingBar />);
    expect(html).toContain('Tabuh Telu');
    expect(html).toContain('Artis a');
    expect(html).toContain('Gamelan Tradisional · 2024');
    expect(html).toContain('1:05');
    expect(html).toContain('4:10');
    expect(html).toMatch(/<img[^>]*src="https:\/\/example.test\/a.jpg"[^>]*alt=""[^>]*aria-hidden="true"/);
    expect(button(html, PLAYER_TEXT.pause)).not.toContain('disabled');
    // Slider tema terang: isi = tinta, rel = token --m-track.
    expect(html).toContain('--slider-color:var(--m-ink, #1d1d1f)');
    expect(html).toContain('--slider-track-bg:var(--m-track, rgba(0, 0, 0, 0.12))');
  });

  it('lagu tanpa audio: putar nonaktif, next tetap aktif, keterangan audio belum tersedia', () => {
    setMusic({ currentSong: B });
    const html = render(<NowPlayingBar />);
    expect(button(html, PLAYER_TEXT.play)).toContain('disabled');
    expect(button(html, PLAYER_TEXT.next)).not.toContain('disabled');
    expect(html).toContain(PLAYER_TEXT.noAudio);
  });

  it('acak/ulang aktif ditandai aria-pressed; Antrean memakai aria-pressed (tertutup saat SSR)', () => {
    setMusic({ currentSong: A, isShuffle: true, isRepeat: false });
    const html = render(<NowPlayingBar />);
    expect(button(html, PLAYER_TEXT.shuffle)).toContain('aria-pressed="true"');
    expect(button(html, PLAYER_TEXT.repeat)).toContain('aria-pressed="false"');
    expect(button(html, PLAYER_TEXT.queue)).toContain('aria-pressed="false"');
  });

  it('bisu → tombol berlabel Bunyikan', () => {
    setMusic({ currentSong: A, isMuted: true });
    button(render(<NowPlayingBar />), PLAYER_TEXT.unmute);
  });

  it('CSS bar hanya memakai backdrop-filter standar (tanpa -webkit- manual)', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(
      'src/app/(public)/(pages)/musik/musik-desa/_com/player/now-playing-bar.module.css',
      'utf8'
    );
    expect(css).toMatch(/^\s*backdrop-filter:\s*blur\(24px\)/m);
    expect(css).not.toMatch(/-webkit-backdrop-filter\s*:/);
  });

  it('tema terang: kaca putih di bar, tanpa cadangan warna gelap di modul pemutar', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = 'src/app/(public)/(pages)/musik/musik-desa/_com/player';
    const bar = readFileSync(`${dir}/now-playing-bar.module.css`, 'utf8');
    expect(bar).toContain('background: rgba(255, 255, 255, 0.82);');
    const sources = readdirSync(dir)
      .filter((f) => /\.(css|tsx?)$/.test(f))
      .map((f) => readFileSync(`${dir}/${f}`, 'utf8'))
      .join('\n');
    // Cadangan lama tema gelap (tinta putih, permukaan #121214, aksen #5da9d8, tint gelap).
    expect(sources).not.toMatch(/var\(--m-ink, #fff\)|#121214|#5da9d8|rgba\(18, 18, 20/i);
  });
});

describe('QueuePanel', () => {
  it('tab Antrean | Baru diputar dalam tablist, Antrean terpilih, tombol tutup', () => {
    const html = render(<QueuePanel onClose={noop} />);
    expect(html).toContain('role="tablist"');
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Antrean</);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>Baru diputar</);
    button(html, PLAYER_TEXT.closeQueue);
  });

  it('dengan lagu: Sedang diputar berisi lagu saat ini (beraksen), lalu Berikutnya sesuai upNext', () => {
    setMusic({ currentSong: A, upNext: [B, C] });
    const html = render(<QueuePanel onClose={noop} />);
    const now = html.indexOf(`>${PLAYER_TEXT.nowPlaying}<`);
    const next = html.indexOf(`>${PLAYER_TEXT.upNext}<`);
    expect(now).toBeGreaterThan(-1);
    expect(next).toBeGreaterThan(now);
    const nowSection = html.slice(now, next);
    expect(nowSection).toContain('Tabuh Telu');
    expect(nowSection).toContain('aria-current="true"');
    const after = html.slice(next);
    expect(after.indexOf('Gending Sore')).toBeLessThan(after.indexOf('Pop Darmasaba'));
    expect(after).not.toContain('Tabuh Telu');
  });

  it('lagu tanpa audio di antrean ditandai redup + keterangan', () => {
    setMusic({ currentSong: A, upNext: [B] });
    const html = render(<QueuePanel onClose={noop} />);
    expect(html).toMatch(/data-playable="false"[\s\S]*Gending Sore[\s\S]*Audio belum tersedia/);
  });

  it('tanpa lagu: "Belum ada lagu diputar" lalu Berikutnya = seluruh urutan', () => {
    const html = render(<QueuePanel onClose={noop} />);
    expect(html).toContain(PLAYER_TEXT.nothingPlaying);
    const after = html.slice(html.indexOf(`>${PLAYER_TEXT.upNext}<`));
    for (const title of ['Tabuh Telu', 'Gending Sore', 'Pop Darmasaba']) {
      expect(after).toContain(title);
    }
  });

  it('ukuran panel ringkas untuk kolom 320px: tab/judul 15px, artis 13px, sampul 48px, baris 6px', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(
      'src/app/(public)/(pages)/musik/musik-desa/_com/player/queue-panel.module.css',
      'utf8'
    );
    // Gabungan semua blok yang selektornya diakhiri `sel {` (termasuk daftar `.a,\n.b {`).
    const rule = (sel: string) =>
      [...css.matchAll(new RegExp(`\\n\\${sel} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join('\n');
    expect(rule('.tab')).toMatch(/font-size: 15px;[\s\S]*font-weight: 600;/);
    expect(rule('.heading')).toMatch(/font-size: 15px;[\s\S]*font-weight: 700;/);
    expect(rule('.rowTitle')).toMatch(/font-size: 15px;[\s\S]*font-weight: 600;/);
    expect(rule('.rowArtist')).toContain('font-size: 13px;');
    expect(rule('.empty')).toContain('font-size: 14px;');
    expect(rule('.cover')).toContain('width: 48px;');
    expect(rule('.row')).toContain('padding: 6px 12px;');
    expect(render(<QueuePanel onClose={noop} />)).toMatch(/<svg[^>]*width="18"[^>]*height="18"[^>]*tabler-icon-x/);
  });

  it('teks kosong Baru diputar tersedia tanpa em dash', () => {
    expect(PLAYER_TEXT.recentEmpty).toBe('Lagu yang Anda putar akan muncul di sini.');
    expect(Object.values(PLAYER_TEXT).join(' ')).not.toContain('—');
  });
});
