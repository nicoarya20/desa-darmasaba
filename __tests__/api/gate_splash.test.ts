// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GATE_PUSH_SCALE,
  GATE_PUSH_SHIFT_VW,
  MAX_SCENE_SCALE,
  buildIntroTimeline,
  buildReducedTimeline,
  buildWaterLoops,
  timelineEndMs,
  wallShiftPx,
  type GateStep,
} from '@/app/(public)/_com/splash/gate-splash.timeline';
import {
  GATE_SPLASH_ATTR,
  GATE_SPLASH_HEAD_SCRIPT,
  GATE_SPLASH_STORAGE_KEY,
  markGateSplashSeen,
  readGateSplashState,
} from '@/app/(public)/_com/splash/gate-splash.session';

const ROOT = path.resolve(__dirname, '../..');
const SPLASH_DIR = path.join(ROOT, 'src/app/(public)/_com/splash');
const css = readFileSync(path.join(SPLASH_DIR, 'gate-splash.module.css'), 'utf8');
const METRICS = { viewportWidth: 1000, gateWidth: 200 }; // test-only

const intro = buildIntroTimeline(METRICS);
const stepsOf = (steps: GateStep[], part: GateStep['part']) => steps.filter((s) => s.part === part);

/** Elemen <html> tiruan: cukup get/setAttribute. */
function fakeDocument(initial?: string) {
  const attrs = new Map<string, string>(initial ? [[GATE_SPLASH_ATTR, initial]] : []);
  const documentElement = {
    getAttribute: (k: string) => attrs.get(k) ?? null,
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
  };
  return { documentElement } as unknown as Document; // test-only
}

function fakeStorage(seen: boolean): Storage {
  const data = new Map<string, string>(seen ? [[GATE_SPLASH_STORAGE_KEY, '1']] : []);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  } as unknown as Storage; // test-only
}

const blockedStorage = {
  getItem: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
  setItem: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
} as unknown as Storage; // test-only

/** Jalankan skrip <head> dengan global tiruan; kembalikan nilai atribut yang ditulis. */
function runHeadScript(pathname: string, storage: Storage): string | null {
  const doc = fakeDocument();
  new Function('document', 'location', 'sessionStorage', GATE_SPLASH_HEAD_SCRIPT)(doc, { pathname }, storage);
  return doc.documentElement.getAttribute(GATE_SPLASH_ATTR);
}

describe('timeline splash gerbang', () => {
  it('zoom adegan selayar penuh tidak melebihi batas aman GPU', () => {
    expect(MAX_SCENE_SCALE).toBeLessThanOrEqual(1.25);
    const scales = stepsOf(intro, 'scene').flatMap((s) =>
      s.keyframes.map((k) => Number(/scale\(([\d.]+)\)/.exec(String(k.transform))?.[1])),
    );
    expect(scales.length).toBeGreaterThan(0);
    scales.forEach((v) => expect(v).toBeLessThanOrEqual(MAX_SCENE_SCALE));
  });

  it('tembok bergeser sejauh gerbang + setengah pertambahan lebarnya', () => {
    expect(wallShiftPx(METRICS)).toBeCloseTo(0.38 * 1000 + 0.3 * 200);
    const [left] = stepsOf(intro, 'wall-l');
    const [right] = stepsOf(intro, 'wall-r');
    expect(left.keyframes[1].translate).toBe(`${-wallShiftPx(METRICS)}px 0`);
    expect(right.keyframes[1].translate).toBe(`${wallShiftPx(METRICS)}px 0`);
  });

  it('gerbang & tirai kiri-kanan bergerak simetris', () => {
    const [gl] = stepsOf(intro, 'gate-l');
    const [gr] = stepsOf(intro, 'gate-r');
    expect(gl.keyframes[1]).toEqual({ translate: `-${GATE_PUSH_SHIFT_VW}vw 0`, scale: `${GATE_PUSH_SCALE}` });
    expect(gr.keyframes[1]).toEqual({ translate: `${GATE_PUSH_SHIFT_VW}vw 0`, scale: `${GATE_PUSH_SCALE}` });
    expect(stepsOf(intro, 'curtain-l')[0].keyframes[1].translate).toBe(`-${GATE_PUSH_SHIFT_VW}vw 0`);
    expect(stepsOf(intro, 'curtain-r')[0].keyframes[1].translate).toBe(`${GATE_PUSH_SHIFT_VW}vw 0`);
  });

  it.each([
    ['intro', intro],
    ['reduced', buildReducedTimeline()],
  ])('%s: tepat satu fade root dan ia yang selesai paling akhir', (_name, steps) => {
    const roots = stepsOf(steps, 'root');
    expect(roots).toHaveLength(1);
    expect(timelineEndMs(roots)).toBe(timelineEndMs(steps));
    expect(roots[0].keyframes.at(-1)).toEqual({ opacity: 0 });
  });

  it('animasi keluar memakai fill "forwards" agar tidak menimpa fade-in sejak t=0', () => {
    const exits = [stepsOf(intro, 'brand')[1], ...stepsOf(intro, 'flash'), ...stepsOf(intro, 'root')];
    exits.forEach((s) => expect(s.options.fill).toBe('forwards'));
  });

  it('lebih singkat dari splash lama (3 detik)', () => {
    expect(timelineEndMs(intro)).toBeLessThan(3000);
  });

  it('versi "kurangi animasi" hanya fade, tanpa gerak', () => {
    const moving = buildReducedTimeline().flatMap((s) => s.keyframes).filter((k) => k.transform || k.translate || k.scale);
    expect(moving).toEqual([]);
  });

  it('riak air berulang dan digeser tepat satu ukuran tile di CSS', () => {
    const loops = buildWaterLoops();
    loops.forEach((s) => expect(s.options.iterations).toBe(Infinity));
    const tile = (cls: string) => {
      const block = new RegExp(`\\.${cls} \\{([^}]*)\\}`).exec(css)?.[1] ?? '';
      const [, w, h] = /width='(\d+)' height='(\d+)'/.exec(block) ?? [];
      expect(block).toContain(`left: -${w}px; top: -${h}px`);
      return { w: Number(w), h: Number(h) };
    };
    const a = tile('rippleA');
    const b = tile('rippleB');
    expect(stepsOf(loops, 'ripple-a')[0].keyframes[1].transform).toBe(`translate(${a.w}px, ${a.h}px)`);
    expect(stepsOf(loops, 'ripple-b')[0].keyframes[0].transform).toBe(`translate(${b.w}px, 0)`);
    expect(stepsOf(loops, 'ripple-b')[0].keyframes[1].transform).toBe(`translate(0, ${b.h}px)`);
  });
});

describe('skrip <head> splash', () => {
  it('memutar splash saat mendarat di beranda dan belum pernah melihatnya', () => {
    expect(runHeadScript('/', fakeStorage(false))).toBe('play');
  });

  it('melewati splash bila sudah dilihat di tab ini', () => {
    expect(runHeadScript('/', fakeStorage(true))).toBe('skip');
  });

  it('melewati splash bila mendarat di halaman lain', () => {
    expect(runHeadScript('/pemerintahan/profil', fakeStorage(false))).toBe('skip');
    expect(runHeadScript('/admin', fakeStorage(false))).toBe('skip');
  });

  it('tetap memutar splash bila sessionStorage diblokir', () => {
    expect(runHeadScript('/', blockedStorage)).toBe('play');
  });
});

describe('status sesi splash', () => {
  it('membaca atribut yang ditulis skrip <head>', () => {
    expect(readGateSplashState(fakeDocument('play'))).toBe('play');
    expect(readGateSplashState(fakeDocument('aneh'))).toBeNull();
    expect(readGateSplashState(fakeDocument())).toBeNull();
  });

  it('menandai selesai di <html> dan sessionStorage', () => {
    const doc = fakeDocument('play');
    const storage = fakeStorage(false);
    markGateSplashSeen(doc, storage);
    expect(readGateSplashState(doc)).toBe('done');
    expect(storage.getItem(GATE_SPLASH_STORAGE_KEY)).toBe('1');
  });

  it('tetap menyembunyikan splash bila sessionStorage diblokir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const doc = fakeDocument('play');
    markGateSplashSeen(doc, blockedStorage);
    expect(readGateSplashState(doc)).toBe('done');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe('kontrak CSS & pemasangan splash', () => {
  it('tersembunyi default, tampil hanya saat <html data-gate-splash="play">', () => {
    expect(css).toMatch(/\.root \{[^}]*display: none;/);
    expect(css).toMatch(/:global\(html\[data-gate-splash="play"\]\) \.root \{\s*display: block;/);
  });

  it('punya failsafe CSS agar halaman tak terkunci tanpa JS', () => {
    expect(css).toMatch(/animation: failsafe [^;]+ forwards;/);
    expect(css).toMatch(/@keyframes failsafe \{\s*to \{ opacity: 0; visibility: hidden; \}/);
  });

  it('di atas navbar & toast', () => {
    const z = Number(/z-index: (\d+);/.exec(css)?.[1]);
    expect(z).toBeGreaterThan(9999);
  });

  it('tanpa prefix -webkit- manual (Lightning CSS) dan tanpa efek mahal selayar penuh', () => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/-webkit-|mix-blend-mode|filter: blur/);
  });

  it('bagian yang dianimasikan adalah elemen HTML, bukan <svg> (animasi <svg> di main thread → tertinggal)', () => {
    const tsx = readFileSync(path.join(SPLASH_DIR, 'GateSplash.tsx'), 'utf8');
    expect(tsx).not.toMatch(/<svg[^>]*data-part=/);
    expect(tsx).toMatch(/<div className=\{`\$\{s\.gate\} \$\{s\.gateL\}`\} data-part="gate-l">/);
  });

  it('skrip <head> dipasang di root layout dan beranda publik (/) memuat splash', () => {
    const layout = readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
    expect(layout).toContain('__html: GATE_SPLASH_HEAD_SCRIPT');
    expect(existsSync(path.join(ROOT, 'src/app/page.tsx'))).toBe(false);
    const home = readFileSync(path.join(ROOT, 'src/app/(public)/page.tsx'), 'utf8');
    expect(home).toContain('<GateSplash />');
  });
});
