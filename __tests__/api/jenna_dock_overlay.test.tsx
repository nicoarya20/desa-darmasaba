// @vitest-environment node
// Dock Jenna + scroll-to-top menyingkir selama overlay halaman terbuka: kunci scroll react-remove-scroll di <body>
// (Modal/Drawer) + state navbar (flyout/cari desktop, menu ponsel).
// Pola: logika murni + pemantau dengan observer palsu + render statis (jsdom rusak).
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/' })); // test-only
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => ({ currentSong: null }) })); // test-only

import { isPageOverlayOpen, isScrollLocked, type PageOverlaySignals, SCROLL_LOCK_ATTR } from '@/app/(public)/_com/jenna/jenna-bar.logic';
import { watchScrollLock } from '@/app/(public)/_com/jenna/use-page-overlay-open';
import jennaState from '@/app/(public)/_com/jenna/jenna.state';
import JennaWidget from '@/app/(public)/_com/jenna/JennaWidget';
import stateNav from '@/state/state-nav';

const wrap = (node: ReactNode) => renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
/** Tag pembuka dock saja: room tertutup di dalamnya juga ber-inert, jadi jangan cari di seluruh HTML. */
const dockTag = (html: string) => /<div[^>]*data-mode="[^"]*"[^>]*>/.exec(html)?.[0] ?? '';

/** Observer palsu: merekam target & opsi, memicu callback sesuai perintah test. */
class FakeObserver {
  static last: FakeObserver | null = null;
  target: unknown = null;
  options: MutationObserverInit | undefined;
  disconnected = false;
  constructor(public callback: MutationCallback) {
    FakeObserver.last = this;
  }
  observe(target: unknown, options?: MutationObserverInit) {
    this.target = target;
    this.options = options;
  }
  disconnect() {
    this.disconnected = true;
  }
  fire() {
    this.callback([], this as unknown as MutationObserver);
  }
}

afterEach(() => {
  jennaState.reset();
  jennaState.status = 'loading';
  FakeObserver.last = null;
  stateNav.clear();
  stateNav.mobileOpen = false;
});

describe('isScrollLocked', () => {
  it('memakai atribut kunci scroll react-remove-scroll (Modal/Drawer Mantine)', () => {
    expect(SCROLL_LOCK_ATTR).toBe('data-scroll-locked');
  });

  it('tanpa atribut = tidak terkunci', () => {
    expect(isScrollLocked(null)).toBe(false);
  });

  it('penghitung > 0 = terkunci, termasuk modal bertumpuk', () => {
    expect(isScrollLocked('1')).toBe(true);
    expect(isScrollLocked('2')).toBe(true);
  });

  it('nilai 0, kosong, atau bukan angka tidak dianggap terkunci', () => {
    expect(isScrollLocked('0')).toBe(false);
    expect(isScrollLocked('')).toBe(false);
    expect(isScrollLocked('abc')).toBe(false);
  });
});

describe('isPageOverlayOpen', () => {
  const closed: PageOverlaySignals = { scrollLock: null, navMenuId: null, navSearch: false, mobileMenu: false };

  it('semua sumber tertutup = dock tampil', () => {
    expect(isPageOverlayOpen(closed)).toBe(false);
  });

  it('Modal/Drawer (kunci scroll body) menyembunyikan dock', () => {
    expect(isPageOverlayOpen({ ...closed, scrollLock: '1' })).toBe(true);
    expect(isPageOverlayOpen({ ...closed, scrollLock: '0' })).toBe(false);
  });

  it('flyout menu desktop menyembunyikan dock', () => {
    expect(isPageOverlayOpen({ ...closed, navMenuId: 'menu-lingkungan' })).toBe(true); // test-only
  });

  it('panel cari desktop menyembunyikan dock', () => {
    expect(isPageOverlayOpen({ ...closed, navSearch: true })).toBe(true);
  });

  it('menu ponsel menyembunyikan dock (dan scroll-to-top)', () => {
    expect(isPageOverlayOpen({ ...closed, mobileMenu: true })).toBe(true);
  });
});

describe('watchScrollLock', () => {
  it('hanya memantau atribut kunci scroll di body, tanpa subtree/childList', () => {
    const body = { tag: 'body' } as unknown as Element; // test-only
    watchScrollLock(body, () => {}, FakeObserver);
    const obs = FakeObserver.last!;
    expect(obs.target).toBe(body);
    expect(obs.options).toEqual({ attributes: true, attributeFilter: ['data-scroll-locked'] });
    expect(obs.options?.subtree).toBeUndefined();
    expect(obs.options?.childList).toBeUndefined();
  });

  it('memanggil onChange tiap mutasi dan melepas observer saat unsubscribe', () => {
    const onChange = vi.fn();
    const stop = watchScrollLock({} as Element, onChange, FakeObserver);
    const obs = FakeObserver.last!;
    obs.fire();
    obs.fire();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(obs.disconnected).toBe(false);
    stop();
    expect(obs.disconnected).toBe(true);
  });
});

const enable = () => {
  jennaState.reset();
  jennaState.status = 'enabled';
  jennaState.assistantName = 'Jenna';
  jennaState.maxInputChars = 500;
};

describe('JennaWidget di server (tanpa body)', () => {
  it('tanpa overlay: dock tampil, tidak inert', () => {
    enable();
    const dock = dockTag(wrap(<JennaWidget />));
    expect(dock).toContain('data-hidden="false"');
    expect(dock).not.toMatch(/\binert\b/);
  });

  it('flyout menu desktop terbuka: dock tersembunyi dan inert', () => {
    enable();
    stateNav.openMenuId = 'menu-lingkungan'; // test-only
    const dock = dockTag(wrap(<JennaWidget />));
    expect(dock).toContain('data-hidden="true"');
    expect(dock).toMatch(/\binert\b/);
  });

  it('panel cari desktop terbuka: dock tersembunyi', () => {
    enable();
    stateNav.isSearch = true;
    expect(dockTag(wrap(<JennaWidget />))).toContain('data-hidden="true"');
  });

  it('menu ponsel terbuka: dock tersembunyi', () => {
    enable();
    stateNav.mobileOpen = true;
    expect(dockTag(wrap(<JennaWidget />))).toContain('data-hidden="true"');
  });
});
