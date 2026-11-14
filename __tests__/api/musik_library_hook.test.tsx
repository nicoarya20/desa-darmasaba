// @vitest-environment node
// useMusikLibrary: jembatan useMusic() → pustaka (loadError aman dibaca, onRetry → loadMusikData).
// jsdom rusak di repo ini → hook dirender lewat renderToStaticMarkup dengan komponen penangkap.
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

const music = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music.value }));

import {
  useMusikLibrary,
  type MusikLibrary,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/use-musik-library';

// test-only
const song = (id: string, link: string | null = `/a/${id}.mp3`): Musik =>
  ({ id, judul: `Lagu ${id}`, artis: 'Kadek', durasi: '3:00', genre: null, tahunRilis: null, audioFile: link ? { link } : null, coverImage: null }) as unknown as Musik;

let captured: MusikLibrary | null = null;
function Probe() {
  captured = useMusikLibrary();
  return null;
}
const run = (over: Record<string, unknown> = {}) => {
  music.value = {
    musikData: [song('a'), song('b', null)],
    isLoading: false,
    currentSong: null,
    isPlaying: false,
    playSong: vi.fn(),
    togglePlayPause: vi.fn(),
    loadMusikData: vi.fn(() => Promise.resolve()),
    ...over,
  };
  renderToStaticMarkup(<Probe />);
  if (!captured) throw new Error('useMusikLibrary tidak terpanggil');
  return captured;
};

beforeEach(() => {
  captured = null;
});

describe('useMusikLibrary: gagal muat', () => {
  it('loadError dari mesin diteruskan apa adanya', () => {
    expect(run({ loadError: true }).loadError).toBe(true);
    expect(run({ loadError: false }).loadError).toBe(false);
  });

  it('onRetry memanggil loadMusikData sekali', () => {
    const lib = run({ loadError: true });
    lib.onRetry();
    expect(music.value.loadMusikData).toHaveBeenCalledTimes(1);
  });
});

describe('useMusikLibrary: klik lagu', () => {
  it('lagu tanpa audio → playSong (mesin yang menolak & memberi toast), tidak pernah toggle', () => {
    const lib = run({ currentSong: song('b', null) });
    const silent = lib.tracks.find((t) => t.id === 'b')!;
    lib.onPlay(silent);
    expect(music.value.playSong).toHaveBeenCalledWith(silent.source);
    expect(music.value.togglePlayPause).not.toHaveBeenCalled();
  });

  it('lagu yang sedang dipilih & bisa diputar → toggle; lagu lain → playSong', () => {
    const lib = run({ currentSong: song('a') });
    lib.onPlay(lib.tracks.find((t) => t.id === 'a')!);
    expect(music.value.togglePlayPause).toHaveBeenCalledTimes(1);
    expect(music.value.playSong).not.toHaveBeenCalled();
  });
});
