// @vitest-environment node
// next-view-transitions di-patch (patches/next-view-transitions@0.3.5.patch): `ready` milik
// transisi yang di-skip browser — dibatalkan transisi baru (AbortError "Transition was skipped")
// atau DOM update melewati batas waktu (TimeoutError) — tidak boleh jadi unhandledrejection;
// error lain tetap harus terlihat.
// Patch kedua: popstate yang hanya mengubah query (menutup overlay `/?program=x` → `/`) tidak
// memulai transisi, karena transisi hanya dilepas saat pathname/hash berubah (layar beku ~4 dtk).
// Catatan: jsdom gagal start di repo ini, jadi router diambil lewat renderToStaticMarkup dan
// `document.startViewTransition` di-stub. Effect tidak jalan di renderToStaticMarkup, jadi jalur
// popstate diuji dengan hook React palsu (lihat `fakeHooks`) yang menjalankan effect sekali.
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routerPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: routerPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

// Hook React palsu hanya untuk test popstate (fakeHooks.on); di luar itu semua diteruskan ke React
// asli. next-view-transitions di-inline (vitest.config), jadi impor `react` di dalamnya ikut ter-mock.
const fakeHooks = vi.hoisted(() => ({ on: false, effects: [] as Array<() => unknown> }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const fake = {
    useState: (init: unknown) => [typeof init === 'function' ? (init as () => unknown)() : init, () => {}],
    useRef: (current: unknown) => ({ current }),
    useEffect: (effect: () => unknown) => {
      fakeHooks.effects.push(effect);
    },
    useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
    use: () => undefined,
  };
  type AnyFn = (...args: unknown[]) => unknown;
  const wrap = <K extends keyof typeof fake>(name: K) =>
    ((...args: unknown[]) =>
      fakeHooks.on
        ? (fake[name] as unknown as AnyFn)(...args)
        : (actual[name] as unknown as AnyFn)(...args)) as unknown;
  const hooks = Object.fromEntries((Object.keys(fake) as Array<keyof typeof fake>).map((name) => [name, wrap(name)]));
  return { ...actual, ...hooks, default: { ...actual, ...hooks } };
});

import { ViewTransitions, useTransitionRouter } from 'next-view-transitions';

type TransitionRouter = ReturnType<typeof useTransitionRouter>;

function captureRouter(): TransitionRouter {
  let router: TransitionRouter | undefined;
  function Probe() {
    router = useTransitionRouter();
    return null;
  }
  renderToStaticMarkup(
    <ViewTransitions>
      <Probe />
    </ViewTransitions>,
  );
  if (!router) throw new Error('useTransitionRouter tidak terpanggil saat render');
  return router;
}

function domException(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

// Pasang stub startViewTransition yang `ready`-nya ditolak dengan `reason`.
function stubStartViewTransition(reason: Error) {
  const startViewTransition = vi.fn(() => ({
    ready: Promise.reject(reason),
    finished: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
    skipTransition: vi.fn(),
  }));
  vi.stubGlobal('document', { startViewTransition });
  return startViewTransition;
}

// Kumpulkan unhandled rejection sendiri (listener Vitest dilepas sementara agar error yang
// memang diharapkan di test "error lain" tidak menggagalkan run).
let unhandled: unknown[] = [];
let vitestListeners: NodeJS.UnhandledRejectionListener[] = [];
const collect = (reason: unknown) => {
  unhandled.push(reason);
};

const flushRejections = () => new Promise((resolve) => setTimeout(resolve, 10));

beforeEach(() => {
  unhandled = [];
  vitestListeners = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', collect);
});

afterEach(() => {
  process.off('unhandledRejection', collect);
  for (const listener of vitestListeners) process.on('unhandledRejection', listener);
  vi.unstubAllGlobals();
  routerPush.mockReset();
});

describe('next-view-transitions: transisi yang dilewati', () => {
  it('push yang transisinya di-skip (AbortError) tidak menghasilkan unhandled rejection', async () => {
    const startViewTransition = stubStartViewTransition(
      domException('AbortError', 'Transition was skipped. New ViewTransition started'),
    );
    const router = captureRouter();

    router.push('/berita');
    await flushRejections();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('onTransitionReady pada transisi yang di-skip tidak memicu rejection ganda', async () => {
    stubStartViewTransition(domException('AbortError', 'Transition was skipped'));
    const onTransitionReady = vi.fn();
    const router = captureRouter();

    router.push('/berita', { onTransitionReady });
    await flushRejections();

    expect(onTransitionReady).not.toHaveBeenCalled();
    expect(unhandled).toEqual([]);
  });

  it('transisi yang melewati batas waktu DOM update (TimeoutError) tidak menghasilkan unhandled rejection', async () => {
    // Chrome membatasi DOM update ~4 detik; callback library menunggu route baru commit
    // (kompilasi route pertama di dev / jaringan lambat). Navigasi tetap selesai tanpa animasi.
    const startViewTransition = stubStartViewTransition(
      domException('TimeoutError', 'Transition was aborted because of timeout in DOM update. DOM update timed out'),
    );
    const router = captureRouter();

    router.push('/pendidikan/info-sekolah');
    await flushRejections();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('error selain AbortError/TimeoutError tetap dilaporkan sebagai unhandled rejection', async () => {
    const invalidState = domException('InvalidStateError', 'Transition was aborted because of invalid state');
    stubStartViewTransition(invalidState);
    const router = captureRouter();

    router.replace('/berita');
    await flushRejections();

    expect(unhandled).toEqual([invalidState]);
  });
});

describe('next-view-transitions: popstate tanpa perubahan pathname/hash', () => {
  type FakeLocation = { pathname: string; search: string; hash: string };

  // "Mount" ViewTransitions dengan hook palsu: render sekali lalu jalankan semua effect
  // (mendaftarkan listener popstate + mencatat pathname/hash yang dirender).
  function mountWithFakeWindow(location: FakeLocation) {
    const popstate: Array<() => void> = [];
    const startViewTransition = vi.fn(() => ({
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    }));
    vi.stubGlobal('document', { startViewTransition });
    vi.stubGlobal('window', {
      location,
      addEventListener: (type: string, listener: () => void) => {
        if (type === 'popstate') popstate.push(listener);
      },
      removeEventListener: vi.fn(),
    });
    fakeHooks.on = true;
    fakeHooks.effects = [];
    try {
      ViewTransitions({ children: null });
      for (const effect of fakeHooks.effects) effect();
    } finally {
      fakeHooks.on = false;
    }
    expect(popstate).toHaveLength(1);
    return { startViewTransition, firePopstate: () => popstate[0]() };
  }

  it('back yang hanya mengubah query (/?program=x → /) tidak memulai view transition', () => {
    // usePathname di-mock '/' → beranda sedang dirender.
    const location = { pathname: '/', search: '?program=cm1', hash: '' };
    const { startViewTransition, firePopstate } = mountWithFakeWindow(location);

    location.search = '';
    firePopstate();

    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it('back yang mengubah pathname tetap memulai view transition', () => {
    const location = { pathname: '/', search: '', hash: '' };
    const { startViewTransition, firePopstate } = mountWithFakeWindow(location);

    location.pathname = '/pemerintahan/berita/semua';
    firePopstate();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
  });

  it('back yang mengubah hash tetap memulai view transition (perilaku lama)', () => {
    const location = { pathname: '/', search: '', hash: '' };
    const { startViewTransition, firePopstate } = mountWithFakeWindow(location);

    location.hash = '#kabar-desa';
    firePopstate();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
  });
});
