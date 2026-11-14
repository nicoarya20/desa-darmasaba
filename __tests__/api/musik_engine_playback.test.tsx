// @vitest-environment node
// Mesin pemutar Musik Desa saat berjalan: lagu tanpa audio, penolakan play(), file rusak, seret slider,
// dan pelepasan sumber. MusicProvider asli dipasang lewat harness (elemen audio & fetch tiruan).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic, useMusicTime, type Musik } from '@/app/context/MusicContext';
import { RECENT_STORAGE_KEY } from '@/app/context/music/recentlyPlayed';
import { MUSIC_TEXT } from '@/app/context/music/music.text';
import {
  fakeStorage,
  fire,
  installBrowserStubs,
  lastAudio,
  libraryReply,
  mount,
  playError,
  run,
  song,
} from './_musik_engine_harness';

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

type Music = ReturnType<typeof useMusic>;
let music: Music;
let time: ReturnType<typeof useMusicTime>;
function Probe() {
  music = useMusic();
  time = useMusicTime();
  return null;
}

const A = song('a');
const B = song('b', { audioFile: null });
const C = song('c');
const D = song('d');

async function start(songs: Musik[] = [A, B, C, D], storage = fakeStorage()) {
  installBrowserStubs([libraryReply(songs)], storage);
  return mount(
    <MusicProvider>
      <Probe />
    </MusicProvider>
  );
}

beforeEach(() => {
  toast.info.mockClear();
  toast.error.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('lagu tanpa audio', () => {
  it('hanya toast info: lagu yang sedang main tidak berhenti dan tidak berganti', async () => {
    await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();
    const before = { src: audio.src, pause: audio.calls.pause, load: audio.calls.load };

    await run(() => music.playSong(B));

    expect(toast.info).toHaveBeenCalledWith(MUSIC_TEXT.noAudio, expect.objectContaining({ toastId: expect.any(String) }));
    expect(music.currentSong?.id).toBe('a');
    expect(music.isPlaying).toBe(true);
    expect({ src: audio.src, pause: audio.calls.pause, load: audio.calls.load }).toEqual(before);
  });

  it('tanpa lagu sebelumnya: bar tetap tidak muncul (currentSong tetap null)', async () => {
    await start();
    await run(() => music.playSong(B));
    expect(music.currentSong).toBeNull();
  });
});

describe('penolakan play()', () => {
  it('AbortError (Berikutnya ditekan cepat) tidak memunculkan toast', async () => {
    await start();
    lastAudio().playResult = () => Promise.reject(playError('AbortError'));
    await run(() => music.playSong(A));
    await run(() => music.playNext());
    expect(toast.error).not.toHaveBeenCalled();
    expect(music.currentSong?.id).toBe('c');
  });

  it('NotAllowedError tetap diberi tahu, sekali, dengan log berkonteks', async () => {
    await start();
    lastAudio().playResult = () => Promise.reject(playError('NotAllowedError'));
    await run(() => music.playSong(A));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(MUSIC_TEXT.playFailed, expect.anything());
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('NotAllowedError'));
  });
});

describe('file audio rusak / 404', () => {
  it('satu toast, tidak masuk Baru diputar, lompat ke lagu berikutnya yang bisa diputar', async () => {
    const storage = fakeStorage();
    await start(undefined, storage);
    const audio = lastAudio();
    audio.playResult = () => Promise.reject(playError('NotSupportedError'));
    await run(() => music.playSong(A));

    audio.error = { code: 4 };
    await fire(audio, 'error');

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(MUSIC_TEXT.fileBroken, expect.objectContaining({ toastId: expect.any(String) }));
    // B tanpa audio dilewati → C.
    expect(music.currentSong?.id).toBe('c');
    expect(audio.src).toBe('https://example.test/c.mp3');
    expect(music.recentlyPlayed).toEqual([]);
    expect(storage.data.get(RECENT_STORAGE_KEY)).toBeUndefined();
  });

  it('semua file rusak → berhenti tanpa putaran tanpa akhir', async () => {
    await start();
    const audio = lastAudio();
    await run(() => music.playSong(A));
    for (let i = 0; i < 6; i += 1) {
      audio.error = { code: 4 };
      await fire(audio, 'error');
    }
    // A, C, D masing-masing dimuat sekali; setelah itu tidak ada kandidat lagi.
    expect(audio.calls.load).toBe(3);
    expect(music.isPlaying).toBe(false);
  });

  it("Baru diputar dicatat pada 'playing', bukan 'play'", async () => {
    await start();
    const audio = lastAudio();
    await run(() => music.playSong(A));
    expect(music.recentlyPlayed).toEqual([]);
    await fire(audio, 'playing');
    expect(music.recentlyPlayed.map((s) => s.id)).toEqual(['a']);
  });
});

describe('seret slider', () => {
  it('pratinjau seret yang tidak dilepas tidak membekukan progres lagu berikutnya', async () => {
    await start();
    const audio = lastAudio();
    await run(() => music.playSong(A));
    await run(() => time.seekPreview(30));
    await run(() => music.playSong(C));
    audio.currentTime = 5;
    await fire(audio, 'timeupdate');
    expect(time.currentTime).toBe(5);
  });

  it("'emptied' / 'loadstart' membatalkan status seret", async () => {
    await start();
    const audio = lastAudio();
    await run(() => music.playSong(A));
    await run(() => time.seekPreview(30));
    await fire(audio, 'emptied');
    audio.currentTime = 7;
    await fire(audio, 'timeupdate');
    expect(time.currentTime).toBe(7);
  });
});

describe('sumber audio', () => {
  it('melepas sumber saat provider dilepas (pause + hapus src + load)', async () => {
    const view = await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();
    const loads = audio.calls.load;
    await view.unmount();
    expect(audio.paused).toBe(true);
    expect(audio.getAttribute('src')).toBeNull();
    expect(audio.calls.load).toBe(loads + 1);
  });
});
