// @vitest-environment node
// next-view-transitions di-patch (patches/next-view-transitions@0.3.5.patch): `ready` milik
// transisi yang dibatalkan transisi baru (AbortError "Transition was skipped") tidak boleh
// jadi unhandledrejection; error lain tetap harus terlihat.
// Catatan: jsdom gagal start di repo ini, jadi router diambil lewat renderToStaticMarkup dan
// `document.startViewTransition` di-stub. Jalur popstate (useEffect) tak bisa dirender di sini.
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routerPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  usePathname: () => '/darmasaba',
  useRouter: () => ({ push: routerPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

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

    router.push('/darmasaba/berita');
    await flushRejections();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('onTransitionReady pada transisi yang di-skip tidak memicu rejection ganda', async () => {
    stubStartViewTransition(domException('AbortError', 'Transition was skipped'));
    const onTransitionReady = vi.fn();
    const router = captureRouter();

    router.push('/darmasaba/berita', { onTransitionReady });
    await flushRejections();

    expect(onTransitionReady).not.toHaveBeenCalled();
    expect(unhandled).toEqual([]);
  });

  it('error selain AbortError tetap dilaporkan sebagai unhandled rejection', async () => {
    const timeout = domException('TimeoutError', 'Transition was aborted because of timeout in DOM update');
    stubStartViewTransition(timeout);
    const router = captureRouter();

    router.replace('/darmasaba/berita');
    await flushRejections();

    expect(unhandled).toEqual([timeout]);
  });
});
