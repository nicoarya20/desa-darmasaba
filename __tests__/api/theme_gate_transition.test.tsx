// @vitest-environment node
// Transisi tema Candi Bentar: timeline (data murni), kunci state, dan markup overlay.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  THEME_SWAP_MS,
  THEME_TRANSITION_TOTAL_MS,
  buildThemeGateTimeline,
  rootFadeResumeTime,
  sceneFor,
  stepEndMs,
  type ThemeGateMetrics,
  type ThemeGateStep,
} from '@/app/(public)/_com/theme-transition/theme-gate.timeline';
import { GATE_PUSH_SCALE, GATE_PUSH_SHIFT_VW, MAX_SCENE_SCALE, wallShiftPx } from '@/app/(public)/_com/splash/gate-splash.timeline';
import ThemeGateTransition from '@/app/(public)/_com/theme-transition/ThemeGateTransition';
import art from '@/app/(public)/_com/theme-transition/theme-gate-scene.module.css';
import stateThemeTransition, {
  endThemeTransition,
  requestThemeTransition,
  setThemeTransitionReady,
} from '@/state/state-theme-transition';

const METRICS: ThemeGateMetrics = { viewportWidth: 1000, gateWidth: 200, glowWidth: 300, rim: { enter: 0.9, rest: 0.55 } }; // test-only
const steps = buildThemeGateTimeline(METRICS);
const stepsOf = (part: ThemeGateStep['part']) => steps.filter((s) => s.part === part);
const only = (part: ThemeGateStep['part']) => {
  const found = stepsOf(part);
  expect(found).toHaveLength(1);
  return found[0];
};
const startMs = (s: ThemeGateStep) => Number(s.options.delay ?? 0);
const pushStart = startMs(only('scene'));
const animatesOpacity = (s: ThemeGateStep) => s.keyframes.some((k) => 'opacity' in k);
const last = (s: ThemeGateStep) => s.keyframes[s.keyframes.length - 1];

// React 19 menaruh <style> Mantine dan <link rel="preload"> logo sebelum root; buang supaya markup diawali root overlay.
const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<link [^>]*\/?>/g, '');

beforeEach(() => {
  endThemeTransition();
  setThemeTransitionReady(true);
});

describe('timeline transisi tema', () => {
  it('total tepat 3 detik (masukan rekan tim user) dan langkah terakhir = root pudar', () => {
    expect(THEME_TRANSITION_TOTAL_MS).toBe(3000);
    expect(Math.max(...steps.map(stepEndMs))).toBe(3000);
    expect(stepEndMs(only('root'))).toBe(3000);
    expect(last(only('root'))).toEqual({ opacity: 0 });
  });

  it('tema ditukar saat langit opak penuh: setelah semua latar masuk, sebelum PUSH', () => {
    const sky = only('sky');
    expect(sky.swap).toBe(true);
    expect(steps.filter((s) => s.swap)).toEqual([sky]);
    expect(last(sky)).toEqual({ opacity: 1 });
    expect(THEME_SWAP_MS).toBe(stepEndMs(sky));
    for (const part of ['sky', 'backdrop', 'side-l', 'side-r'] as const) {
      stepsOf(part).forEach((s) => expect(THEME_SWAP_MS).toBeGreaterThanOrEqual(stepEndMs(s)));
    }
    expect(THEME_SWAP_MS).toBeLessThan(pushStart);
  });

  it('T4: gerbang & tembok hanya bergerak keluar (kiri negatif, kanan positif)', () => {
    const gateL = only('gate-l');
    const gateR = only('gate-r');
    const wallL = only('wall-l');
    const wallR = only('wall-r');
    [gateL, gateR, wallL, wallR].forEach((s) => {
      expect(startMs(s)).toBe(pushStart);
      expect(s.keyframes[0].translate).toBe('0 0');
    });
    expect(last(gateL)).toEqual({ translate: `-${GATE_PUSH_SHIFT_VW}vw 0`, scale: `${GATE_PUSH_SCALE}` });
    expect(last(gateR)).toEqual({ translate: `${GATE_PUSH_SHIFT_VW}vw 0`, scale: `${GATE_PUSH_SCALE}` });
    const wall = wallShiftPx(METRICS);
    expect(wall).toBeGreaterThan(0);
    expect(last(wallL).translate).toBe(`${-wall}px 0`);
    expect(last(wallR).translate).toBe(`${wall}px 0`);
    // Slide masuk sudah selesai & diendapkan sebelum T4 → tak ada gerak mundur saat PUSH.
    for (const part of ['side-l', 'side-r'] as const) {
      const s = only(part);
      expect(stepEndMs(s)).toBeLessThanOrEqual(pushStart);
      expect(last(s)).toEqual({ translate: '0 0' });
      expect(s.settle).toBe('self');
    }
  });

  it('T4: zoom adegan maks MAX_SCENE_SCALE dan cahaya hanya melebar', () => {
    expect(last(only('scene'))).toEqual({ transform: `scale(${MAX_SCENE_SCALE})` });
    const glow = only('glow');
    const scaleX = Number(String(last(glow).scale).split(' ')[0]);
    expect(scaleX).toBeGreaterThan(1);
    expect(startMs(glow)).toBe(pushStart);
  });

  it('T4: tak ada animasi opacity selayar penuh selain cahaya akhir & root', () => {
    const inT4 = steps.filter((s) => animatesOpacity(s) && stepEndMs(s) > pushStart);
    expect(inT4.map((s) => s.part).sort()).toEqual(['flash', 'root']);
    // Animasi masuk ber-opacity lain diendapkan (cancel) begitu selesai; logo setelah pamit.
    steps
      .filter((s) => animatesOpacity(s) && !['flash', 'root', 'brand'].includes(s.part))
      .forEach((s) => expect(s.settle).toBe('self'));
    expect(stepsOf('brand').at(-1)?.settle).toBe('part');
  });

  it('hanya pudar root yang ditahan sampai tema tertukar & dilukis', () => {
    expect(steps.filter((s) => s.holdUntilSwap).map((s) => s.part)).toEqual(['root']);
  });

  it('pudar root: swap tepat waktu → jadwal identik (mulai 2720, total 3000)', () => {
    const root = only('root');
    const delay = startMs(root);
    const duration = Number(root.options.duration);
    expect(delay).toBe(2720);
    // Dilepas 2 frame setelah swap 1440: animasi dilanjutkan dari waktu berjalan, jadi tak ada pergeseran.
    const releasedAt = THEME_SWAP_MS + 33;
    const current = rootFadeResumeTime(releasedAt, delay);
    expect(current).toBe(releasedAt);
    expect(releasedAt + (delay + duration - current)).toBe(THEME_TRANSITION_TOTAL_MS);
  });

  it('pudar root: swap terlambat → cahaya tetap opak, pudar mulai saat dilepas dengan durasi penuh', () => {
    const root = only('root');
    const delay = startMs(root);
    const duration = Number(root.options.duration);
    const releasedAt = 6200; // test-only: perangkat lambat, jauh melewati jadwal pudar
    const current = rootFadeResumeTime(releasedAt, delay);
    expect(current).toBe(delay); // awal fase aktif: opacity masih 1
    expect(releasedAt + (delay + duration - current)).toBe(releasedAt + duration);
    expect(last(only('flash')).opacity).toBe(1);
    expect(only('flash').options.fill).toBe('forwards');
    expect(rootFadeResumeTime(-5, delay)).toBe(0);
  });

  it('rim tegas selama pilar di atas halaman lama, lalu nilai adegan', () => {
    for (const part of ['rim', 'wall'] as const) {
      const s = only(part);
      expect(s.keyframes).toEqual([{ opacity: 0.9 }, { opacity: 0.55 }]);
      expect(stepEndMs(s)).toBeLessThanOrEqual(THEME_SWAP_MS);
    }
    expect(only('wall').options.pseudoElement).toBe('::before');
  });
});

describe('state transisi tema', () => {
  it('kunci: permintaan kedua selama transisi ditolak, terbuka lagi setelah selesai', () => {
    expect(requestThemeTransition('dark', { reducedMotion: false })).toBe('animate');
    expect(stateThemeTransition.target).toBe('dark');
    expect(requestThemeTransition('light', { reducedMotion: false })).toBe('busy');
    expect(requestThemeTransition('light', { reducedMotion: true })).toBe('busy');
    expect(stateThemeTransition.target).toBe('dark');
    endThemeTransition();
    expect(requestThemeTransition('light', { reducedMotion: false })).toBe('animate');
  });

  it('kurangi gerak: tanpa overlay, pemanggil menukar tema langsung', () => {
    expect(requestThemeTransition('dark', { reducedMotion: true })).toBe('direct');
    expect(stateThemeTransition.target).toBeNull();
  });

  it('overlay belum siap (chunk belum/gagal dimuat): tema ditukar langsung, tak terkunci', () => {
    setThemeTransitionReady(false);
    expect(requestThemeTransition('dark', { reducedMotion: false })).toBe('direct');
    expect(stateThemeTransition.target).toBeNull();
  });
});

describe('overlay ThemeGateTransition', () => {
  it('adegan = tema tujuan', () => {
    expect(sceneFor('dark')).toBe('night');
    expect(sceneFor('light')).toBe('day');
  });

  it('tersembunyi saat tak ada transisi', () => {
    const html = render(<ThemeGateTransition />);
    expect(html).not.toContain('data-playing');
    expect(html).toContain('aria-hidden="true"');
  });

  it('ke gelap: root memegang kelas seni, data-scene="night", dan data-playing', () => {
    requestThemeTransition('dark', { reducedMotion: false });
    const root = /^<div[^>]*>/.exec(render(<ThemeGateTransition />))?.[0] ?? '';
    expect(root).toContain(art.scene);
    expect(root).toContain('data-scene="night"');
    expect(root).toContain('data-playing=""');
  });

  it('ke terang: data-scene="day"; latar hanya ditandai di dunia asli (pantulan ikut lewat air)', () => {
    requestThemeTransition('light', { reducedMotion: false });
    const html = render(<ThemeGateTransition />);
    expect(html).toContain('data-scene="day"');
    // Dunia asli: glow, halo, bulan, bintang, lantai + air = 6 elemen latar.
    expect(html.match(/data-part="[^"]*\bbackdrop\b[^"]*"/g)).toHaveLength(6);
    // Gerbang, tembok & rim ada di dua dunia (asli + pantulan).
    expect(html.match(/data-part="gate-l"/g)).toHaveLength(2);
    expect(html.match(/data-part="wall wall-r"/g)).toHaveLength(2);
    expect(html.match(/data-part="rim"/g)).toHaveLength(4);
  });

  it('geometri --horizon & --zoom-y di .root, elemen yang sama dengan kelas seni (token langit memakainya)', () => {
    const css = readFileSync(
      path.resolve(__dirname, '../../src/app/(public)/_com/theme-transition/theme-gate.module.css'),
      'utf8',
    );
    const rootBlock = /\n\.root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(rootBlock).toMatch(/--horizon:/);
    expect(rootBlock).toMatch(/--zoom-y:/);
    expect(rootBlock).toMatch(/z-index:\s*10000/);
    expect(rootBlock).toMatch(/display:\s*none/);
  });
});
