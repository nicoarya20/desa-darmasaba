// @vitest-environment node
// useMusic().stop() dan sambungan mesin ke Media Session API (layar kunci / notifikasi / tombol media).
// MusicProvider asli dipasang lewat harness; navigator.mediaSession & MediaMetadata tiruan.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic, useMusicTime, type Musik } from '@/app/context/MusicContext';
import { fire, installBrowserStubs, lastAudio, libraryReply, mount, RequestLibrary, run, song } from './_musik_engine_harness';

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

let music: ReturnType<typeof useMusic>;
let time: ReturnType<typeof useMusicTime>;
function Probe() {
  music = useMusic();
  time = useMusicTime();
  return null;
}

/** MediaMetadata tiruan: cukup menyimpan isinya. test-only */
class FakeMediaMetadata {
  constructor(public init: MediaMetadataInit) {}
}

/** navigator.mediaSession tiruan. test-only */
function fakeMediaSession() {
  const handlers = new Map<string, MediaSessionActionHandler>();
  return {
    metadata: null as FakeMediaMetadata | null,
    playbackState: 'none' as MediaSessionPlaybackState,
    handlers,
    setActionHandler: (action: string, handler: MediaSessionActionHandler | null) => {
      if (handler) handlers.set(action, handler);
      else handlers.delete(action);
    },
    setPositionState: vi.fn(),
  };
}
let session: ReturnType<typeof fakeMediaSession>;

const cover = { id: 'c', name: 'c', realName: 'c', path: 'c', mimeType: 'image/png', link: 'https://example.test/a.png' };
const A = song('a', { coverImage: cover });
const B = song('b');

async function start(songs: Musik[] = [A, B], withSession = true) {
  installBrowserStubs([libraryReply(songs)]);
  session = fakeMediaSession();
  vi.stubGlobal('navigator', withSession ? { mediaSession: session } : {});
  vi.stubGlobal('MediaMetadata', FakeMediaMetadata);
  return mount(
    <MusicProvider>
      <RequestLibrary />
      <Probe />
    </MusicProvider>
  );
}

const invoke = (action: string, details: Omit<Partial<MediaSessionActionDetails>, 'action'> = {}) =>
  run(() => session.handlers.get(action)?.({ action: action as MediaSessionAction, ...details }));

beforeEach(() => {
  toast.info.mockClear();
  toast.error.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('stop()', () => {
  it('jeda, posisi 0, sumber dilepas, currentSong null', async () => {
    await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();
    audio.duration = 154;
    await fire(audio, 'loadedmetadata');
    audio.currentTime = 40;
    await fire(audio, 'timeupdate');
    const before = { pause: audio.calls.pause, load: audio.calls.load };

    await run(() => music.stop());

    expect(music.currentSong).toBeNull();
    expect(music.isPlaying).toBe(false);
    expect(audio.paused).toBe(true);
    expect(audio.getAttribute('src')).toBeNull();
    expect(audio.calls.pause).toBe(before.pause + 1);
    expect(audio.calls.load).toBe(before.load + 1);
    expect({ currentTime: time.currentTime, duration: time.duration }).toEqual({ currentTime: 0, duration: 0 });
  });

  it('saat dijeda dan tanpa lagu: aman, tetap tanpa lagu', async () => {
    await start();
    await run(() => music.stop());
    expect(music.currentSong).toBeNull();

    await run(() => music.playSong(A));
    await run(() => music.togglePlayPause());
    await run(() => music.stop());
    expect(music.currentSong).toBeNull();
    expect(music.isPlaying).toBe(false);
  });

  it("'error' setelah sumber dilepas bukan file rusak (tanpa toast), dan lagu bisa diputar lagi", async () => {
    await start();
    await run(() => music.playSong(A));
    await run(() => music.stop());
    const audio = lastAudio();

    await fire(audio, 'error');
    expect(toast.error).not.toHaveBeenCalled();

    await run(() => music.playSong(B));
    expect(music.currentSong?.id).toBe('b');
    expect(music.isPlaying).toBe(true);
    expect(audio.getAttribute('src')).toBe(B.audioFile?.link);
  });
});

describe('Media Session', () => {
  it('metadata lagu (judul, artis, sampul) dan playbackState mengikuti putar/jeda', async () => {
    await start();
    await run(() => music.playSong(A));
    expect(session.metadata?.init).toEqual({
      title: A.judul,
      artist: A.artis,
      artwork: [{ src: cover.link, type: 'image/png' }],
    });
    expect(session.playbackState).toBe('playing');

    await fire(lastAudio(), 'pause');
    expect(session.playbackState).toBe('paused');

    await run(() => music.playSong(B));
    expect(session.metadata?.init).toEqual({ title: B.judul, artist: B.artis, artwork: [] });
  });

  it('aksi play/pause/previoustrack/nexttrack menggerakkan mesin', async () => {
    await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();
    expect([...session.handlers.keys()].sort()).toEqual(['nexttrack', 'pause', 'play', 'previoustrack', 'seekto']);

    await invoke('pause');
    expect(music.isPlaying).toBe(false);
    await invoke('pause'); // sudah dijeda: tidak berbalik jadi putar
    expect(music.isPlaying).toBe(false);
    await invoke('play');
    expect(music.isPlaying).toBe(true);
    const plays = audio.calls.play;
    await invoke('play'); // sudah diputar: tidak memanggil play() lagi
    expect(audio.calls.play).toBe(plays);

    await invoke('nexttrack');
    expect(music.currentSong?.id).toBe('b');
    await invoke('previoustrack');
    expect(music.currentSong?.id).toBe('a');
  });

  it('ulang mati di lagu terakhir: nexttrack dilepas', async () => {
    await start();
    await run(() => music.playSong(B));
    expect(music.hasNext).toBe(false);
    expect(session.handlers.has('nexttrack')).toBe(false);
    expect(session.handlers.has('previoustrack')).toBe(true);
  });

  it('seekto hanya berlaku setelah durasi diketahui (canSeek)', async () => {
    await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();

    await invoke('seekto', { seekTime: 30 });
    expect(audio.currentTime).toBe(0);

    audio.duration = 154;
    await fire(audio, 'loadedmetadata');
    await invoke('seekto', { seekTime: 30 });
    expect(audio.currentTime).toBe(30);
    expect(time.currentTime).toBe(30);
  });

  it("setPositionState saat metadata/seek/putar-jeda, bukan tiap 'timeupdate'; 'emptied' mengosongkannya", async () => {
    await start();
    await run(() => music.playSong(A));
    const audio = lastAudio();
    audio.duration = 154;
    await fire(audio, 'loadedmetadata');
    expect(session.setPositionState).toHaveBeenLastCalledWith({ duration: 154, position: 0, playbackRate: 1 });

    const calls = session.setPositionState.mock.calls.length;
    for (const t of [1, 2, 3]) {
      audio.currentTime = t;
      await fire(audio, 'timeupdate');
    }
    expect(session.setPositionState.mock.calls.length).toBe(calls);

    audio.currentTime = 60;
    await fire(audio, 'seeked');
    expect(session.setPositionState).toHaveBeenLastCalledWith({ duration: 154, position: 60, playbackRate: 1 });

    await fire(audio, 'emptied');
    expect(session.setPositionState).toHaveBeenLastCalledWith();
  });

  it('stop() melepas metadata, status, dan semua aksi', async () => {
    await start();
    await run(() => music.playSong(A));
    await run(() => music.stop());
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
    expect(session.handlers.size).toBe(0);
  });

  it('provider dilepas: metadata, status, dan aksi dibersihkan', async () => {
    const view = await start();
    await run(() => music.playSong(A));
    await view.unmount();
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
    expect(session.handlers.size).toBe(0);
  });

  it('browser tanpa mediaSession: pemutar tetap jalan tanpa galat', async () => {
    await start([A, B], false);
    await run(() => music.playSong(A));
    expect(music.isPlaying).toBe(true);
    await run(() => music.stop());
    expect(music.currentSong).toBeNull();
  });
});
