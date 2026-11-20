// Pemasang React untuk test di environment node (bukan file test). jsdom rusak di repo ini (cssstyle TLA), jadi
// komponen uji dipasang lewat react-dom/client di wadah tiruan minimal. Komponen uji harus me-render `null`: React
// tidak pernah membuat elemen DOM; yang diuji = state & efek hook yang sebenarnya, bukan markup.
// Dipakai harness mesin Musik (`api/_musik_engine_harness.tsx`) dan test gerbang fetch beranda.
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';

/** Pasang `window` + `document` minimal yang dibutuhkan createRoot; `extra` digabung ke `window`. test-only */
export function installMinimalDom<T extends object>(extra: T = {} as T) {
  const win = Object.assign(new EventTarget(), { HTMLIFrameElement: class {} }, extra);
  vi.stubGlobal('window', win);
  vi.stubGlobal('HTMLIFrameElement', win.HTMLIFrameElement);
  vi.stubGlobal('document', {
    nodeType: 9,
    activeElement: null,
    addEventListener() {},
    removeEventListener() {},
    defaultView: win,
  });
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  return win;
}

/** Wadah tiruan untuk createRoot; tidak pernah diisi elemen karena komponen uji me-render null. */
function fakeContainer() {
  const container: Record<string, unknown> = {
    nodeType: 1,
    nodeName: 'DIV',
    tagName: 'DIV',
    childNodes: [],
    firstChild: null,
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    insertBefore() {},
    removeChild() {},
  };
  container.ownerDocument = { ...(globalThis.document as object), documentElement: container };
  return container as unknown as Element;
}

/** Render pohon React di wadah tiruan; `flush` menunggu promise (fetch, play) selesai di dalam act. */
export async function mount(node: ReactNode) {
  const root: Root = createRoot(fakeContainer());
  await act(async () => root.render(node));
  await flush();
  return {
    rerender: async (next: ReactNode) => {
      await act(async () => root.render(next));
      await flush();
    },
    unmount: () => act(async () => root.unmount()),
  };
}

export async function flush() {
  for (let i = 0; i < 5; i += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

/** Jalankan aksi (setter, callback hook) di dalam act lalu tunggu promise turunan. */
export async function run(action: () => void) {
  await act(async () => action());
  await flush();
}
