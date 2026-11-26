// @vitest-environment node
// Kartu & widget Now Playing situs (pengganti FixedPlayerBar di luar aplikasi Musik). jsdom rusak di repo ini:
// markup diuji lewat renderToStaticMarkup, klik × lewat pohon elemen (NowPlayingCard tidak memakai hook React
// selain useMusic tiruan), transisi kartu ↔ pil lewat reducer murni. Hover/scroll/timer nyata: QA port 3000.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MantineProvider } from '@mantine/core';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

const music = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
const env = vi.hoisted(() => ({ desktop: true, overlay: false }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music.state, useMusicTime: () => music.state }));
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('@mantine/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mantine/hooks')>()),
  useMediaQuery: () => env.desktop,
}));
vi.mock('@/app/(public)/_com/jenna/use-page-overlay-open', () => ({ usePageOverlayOpen: () => env.overlay }));

import { EqualizerBars } from '@/app/(public)/_com/now-playing/EqualizerBars';
import { NowPlayingCard } from '@/app/(public)/_com/now-playing/NowPlayingCard';
import { NowPlayingWidget } from '@/app/(public)/_com/now-playing/NowPlayingWidget';
import {
  remainingText,
  shouldScheduleCollapse,
  WIDGET_INITIAL,
  widgetReducer,
  type WidgetState,
} from '@/app/(public)/_com/now-playing/now-playing.logic';
import { NOW_PLAYING_TEXT as T } from '@/app/(public)/_com/now-playing/now-playing.text';

// test-only: lagu fiktif berbentuk respons /api/desa/musik/find-many.
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'x', link });
const song = (id: string, judul: string, extra: Partial<Musik> = {}): Musik => ({
  id,
  judul,
  artis: `Artis ${id}`,
  deskripsi: null,
  durasi: '03:35',
  genre: null,
  tahunRilis: null,
  audioFile: file(`https://example.test/${id}.mp3`),
  coverImage: file(`https://example.test/${id}.jpg`),
  isActive: true,
  ...extra,
});
const A = song('a', 'Tabuh Telu');
const NO_AUDIO = song('b', 'Gending Sore', { audioFile: null });

const noop = () => {};
function setMusic(overrides: Record<string, unknown> = {}) {
  music.state = {
    currentSong: null,
    isPlaying: false,
    hasNext: true,
    currentTime: 0,
    duration: 0,
    togglePlayPause: noop,
    playPrev: noop,
    playNext: noop,
    stop: noop,
    seek: noop,
    seekPreview: noop,
    ...overrides,
  };
}

// React 19 menaruh hint `<link rel="preload" as="image">` untuk <img> sampul di depan markup; dibuang supaya
// assertion bisa menjangkar elemen akar komponen di awal string.
const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<link rel="preload"[^>]*\/>/g, '');
const button = (html: string, label: string) => {
  const match = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`));
  expect(match, `tombol "${label}"`).not.toBeNull();
  return match![0];
};
const thumb = (html: string) => html.match(/<div[^>]*role="slider"[^>]*>/)?.[0] ?? '';

/** Cari elemen ber-aria-label di pohon hasil pemanggilan komponen (tanpa merender). */
function findByLabel(node: ReactNode, label: string): ReactElement<{ onClick?: () => void }> | null {
  if (!isValidElement(node)) return null;
  const props = node.props as { 'aria-label'?: string; children?: ReactNode };
  if (props['aria-label'] === label) return node as ReactElement<{ onClick?: () => void }>;
  for (const child of Children.toArray(props.children)) {
    const hit = findByLabel(child, label);
    if (hit) return hit;
  }
  return null;
}

beforeEach(() => {
  setMusic();
  env.desktop = true;
  env.overlay = false;
});

describe('NowPlayingCard', () => {
  it('tanpa lagu: tidak dirender', () => {
    expect(render(<NowPlayingCard variant="widget" />)).toBe('');
    expect(render(<NowPlayingCard variant="menu" />)).toBe('');
  });

  it('sampul + judul + artis menaut ke Musik Desa dengan nama tautan Indonesia', () => {
    setMusic({ currentSong: A });
    const html = render(<NowPlayingCard variant="widget" />);
    expect(html).toContain(`aria-label="${T.region}"`);
    expect(html).toMatch(new RegExp(`<a href="/musik/musik-desa"[^>]*aria-label="${T.open('Tabuh Telu', 'Artis a')}"`));
    expect(html).toContain('Tabuh Telu');
    expect(html).toContain('Artis a');
    expect(html).toContain('src="https://example.test/a.jpg"');
  });

  it('waktu berjalan dan sisa waktu gaya iPhone, slider aktif dengan aria-valuetext', () => {
    setMusic({ currentSong: A, currentTime: 131, duration: 215 });
    const html = render(<NowPlayingCard variant="widget" />);
    expect(html).toContain('>2:11<');
    expect(html).toContain('>-1:24<');
    expect(thumb(html)).not.toContain('aria-disabled="true"');
    expect(thumb(html)).toContain('aria-valuetext="2:11 dari 3:35"');
  });

  it('lagu tanpa audio: putar & slider nonaktif, waktu nol', () => {
    setMusic({ currentSong: NO_AUDIO, currentTime: 0, duration: 0 });
    const html = render(<NowPlayingCard variant="widget" />);
    expect(button(html, T.play)).toContain('disabled');
    expect(button(html, T.play)).toContain(`title="${T.noAudio}"`);
    expect(thumb(html)).toContain('aria-disabled="true"');
    expect(html).toContain('>0:00<');
    expect(html).toContain('>-0:00<');
  });

  it('sedang main → tombol Jeda; ujung urutan → Berikutnya nonaktif', () => {
    setMusic({ currentSong: A, isPlaying: true, hasNext: false });
    const html = render(<NowPlayingCard variant="widget" />);
    expect(button(html, T.pause)).not.toContain('disabled');
    expect(button(html, T.next)).toContain('disabled');
    expect(button(html, T.prev)).not.toContain('disabled');
  });

  it('tanpa acak, ulang, atau volume (tetap di aplikasi Musik)', () => {
    setMusic({ currentSong: A });
    const html = render(<NowPlayingCard variant="widget" />);
    expect(html).not.toMatch(/Acak|Ulang|Volume|Bisukan|Shuffle|Repeat/);
    expect([...html.matchAll(/role="slider"/g)]).toHaveLength(1);
  });

  it('× memanggil stop() (lagu dihentikan, kartu hilang), lalu onStop', () => {
    const calls: string[] = [];
    setMusic({ currentSong: A, stop: () => calls.push('stop') });
    const close = findByLabel(NowPlayingCard({ variant: 'menu', onStop: () => calls.push('onStop') }), T.stop);
    expect(close).not.toBeNull();
    close!.props.onClick?.();
    expect(calls).toEqual(['stop', 'onStop']);
    // Tanpa onStop (widget desktop) tetap aman.
    findByLabel(NowPlayingCard({ variant: 'widget' }), T.stop)!.props.onClick?.();
    expect(calls).toEqual(['stop', 'onStop', 'stop']);
  });

  it('tautan memanggil onNavigate (mis. menutup panel menu ponsel)', () => {
    setMusic({ currentSong: A });
    const onNavigate = vi.fn();
    const link = findByLabel(NowPlayingCard({ variant: 'menu', onNavigate }), T.open('Tabuh Telu', 'Artis a'));
    expect(link?.props.onClick).toBe(onNavigate);
  });

  it('varian ditandai untuk CSS (widget 340px berbayang, menu selebar wadah)', () => {
    setMusic({ currentSong: A });
    expect(render(<NowPlayingCard variant="menu" />)).toContain('data-variant="menu"');
    const css = readFileSync(resolve(process.cwd(), 'src/app/(public)/_com/now-playing/now-playing-card.module.css'), 'utf8');
    expect(css).toMatch(/\.card\[data-variant="widget"\] \{\s*width: 340px;/);
    expect(css).toMatch(/\.card\[data-variant="menu"\] \{\s*width: 100%;/);
  });
});

describe('EqualizerBars', () => {
  it('dekoratif, 3 bar, status main lewat data-playing', () => {
    const html = render(<EqualizerBars playing />);
    expect(html).toMatch(/^<span[^>]*data-playing="true"[^>]*aria-hidden="true"/);
    expect([...html.matchAll(/<span class="[^"]*"><\/span>/g)]).toHaveLength(3);
    expect(render(<EqualizerBars playing={false} />)).toContain('data-playing="false"');
  });

  it('animasi hanya saat main dan tanpa reduced-motion', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/app/(public)/_com/now-playing/equalizer-bars.module.css'), 'utf8');
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.eq\[data-playing="true"\] \.bar \{\s*animation:/);
    expect(css.split('animation:')).toHaveLength(2);
  });
});

describe('NowPlayingWidget', () => {
  it('tanpa lagu atau di bawah navbar desktop: tidak dirender', () => {
    expect(render(<NowPlayingWidget />)).toBe('');
    setMusic({ currentSong: A });
    env.desktop = false;
    expect(render(<NowPlayingWidget />)).toBe('');
  });

  it('awal = kartu terbuka; pil inert tapi bernama untuk membuka kartu lagi', () => {
    setMusic({ currentSong: A, isPlaying: true });
    const html = render(<NowPlayingWidget />);
    expect(html).toMatch(/^<div[^>]*data-expanded="true"[^>]*data-hidden="false"/);
    const pill = button(html, T.expand('Tabuh Telu'));
    expect(pill).toContain('inert=""');
    expect(pill).toContain('aria-expanded="true"');
    expect(html).toContain('data-variant="widget"');
    expect(html).toContain('data-playing="true"');
  });

  it('overlay halaman terbuka: widget disingkirkan (inert)', () => {
    setMusic({ currentSong: A });
    env.overlay = true;
    expect(render(<NowPlayingWidget />)).toMatch(/^<div[^>]*data-hidden="true"[^>]*inert=""/);
  });

  it('CSS: di bawah navbar 44px, z di bawah navbar/Jenna, hanya transform/opacity, tanpa prefix -webkit- manual', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/app/(public)/_com/now-playing/now-playing-widget.module.css'), 'utf8');
    expect(css).toContain('top: calc(44px + 12px);');
    expect(css).toContain('right: var(--edge-gutter, 24px);');
    expect(css).toContain('z-index: 98;');
    expect(css).not.toContain('-webkit-backdrop-filter');
    const transitioned = [...css.matchAll(/transition:([^;]*);/g)].map((m) => m[1]).join(',');
    expect(transitioned).not.toMatch(/\b(width|height|top|right|left|bottom|clip-path)\b/);
  });
});

describe('now-playing.logic', () => {
  it('remainingText: sisa = durasi - posisi, durasi belum diketahui → -0:00', () => {
    expect(remainingText(131, 215)).toBe('-1:24');
    expect(remainingText(0, 215)).toBe('-3:35');
    expect(remainingText(300, 215)).toBe('-0:00');
    expect(remainingText(10, 0)).toBe('-0:00');
    expect(remainingText(10, Number.NaN)).toBe('-0:00');
  });

  const reduce = (events: Parameters<typeof widgetReducer>[1][], from: WidgetState = WIDGET_INITIAL) =>
    events.reduce(widgetReducer, from);

  it('idle / scroll mengecilkan kartu jadi pil, kecuali sedang disorot atau difokus keyboard', () => {
    expect(reduce(['idle']).expanded).toBe(false);
    expect(reduce(['scroll']).expanded).toBe(false);
    expect(reduce(['enter', 'scroll']).expanded).toBe(true);
    expect(reduce(['focusin', 'idle']).expanded).toBe(true);
    expect(reduce(['enter', 'leave', 'idle']).expanded).toBe(false);
  });

  it('hover, fokus, atau open dari pil membuka kartu lagi', () => {
    const pill = reduce(['idle']);
    expect(widgetReducer(pill, 'enter').expanded).toBe(true);
    expect(widgetReducer(pill, 'focusin').expanded).toBe(true);
    expect(widgetReducer(pill, 'open').expanded).toBe(true);
  });

  it('close (Escape, room Jenna) memaksa pil walau disorot', () => {
    expect(reduce(['enter', 'focusin', 'close'])).toEqual({ expanded: false, hover: true, focus: false });
  });

  it('tanpa perubahan → objek yang sama (React melewati render)', () => {
    const pill = reduce(['idle']);
    expect(widgetReducer(pill, 'scroll')).toBe(pill);
    expect(widgetReducer(WIDGET_INITIAL, 'open')).toBe(WIDGET_INITIAL);
  });

  it('timer mengecil hanya saat kartu terbuka tanpa hover/fokus', () => {
    expect(shouldScheduleCollapse(WIDGET_INITIAL)).toBe(true);
    expect(shouldScheduleCollapse(reduce(['enter']))).toBe(false);
    expect(shouldScheduleCollapse(reduce(['focusin']))).toBe(false);
    expect(shouldScheduleCollapse(reduce(['idle']))).toBe(false);
  });

  it('teks UI tanpa em dash', () => {
    const texts = Object.values(T).map((v) =>
      typeof v === 'function' ? (v as (...args: string[]) => string)('Judul', 'Artis') : v,
    );
    expect(texts.join(' ')).not.toContain('—');
  });
});
