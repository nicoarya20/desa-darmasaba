// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  DOT,
  DOT_WINDOW,
  INITIAL_WHEEL_STATE,
  buildLoopTrack,
  dotCenterX,
  reduceWheel,
  loopStart,
  normalizeLoopIndex,
  realIndex,
  swipeStep,
} from '@/app/darmasaba/_com/main-page/layanan-potensi/gallery.logic';

describe('buildLoopTrack', () => {
  it('mengulang item agar tiap sisi salinan tengah punya minimal buffer kartu', () => {
    const track = buildLoopTrack(['a', 'b', 'c'], 4);
    // ceil(4/3)=2 salinan per sisi → 5 salinan
    expect(track).toHaveLength(15);
    const start = loopStart(3, 4);
    expect(start).toBe(6);
    expect(track.slice(start, start + 3)).toEqual(['a', 'b', 'c']);
    expect(start).toBeGreaterThanOrEqual(4);
    expect(track.length - (start + 3)).toBeGreaterThanOrEqual(4);
  });

  it('cukup satu salinan per sisi bila item ≥ buffer', () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    expect(buildLoopTrack(items, 4)).toHaveLength(30);
    expect(loopStart(10, 4)).toBe(10);
  });

  it('tidak membuat loop untuk 0 atau 1 item', () => {
    expect(buildLoopTrack([], 4)).toEqual([]);
    expect(buildLoopTrack(['x'], 4)).toEqual(['x']);
    expect(loopStart(1, 4)).toBe(0);
    expect(loopStart(0, 4)).toBe(0);
  });
});

describe('realIndex', () => {
  it('memetakan indeks track ke item asli, termasuk indeks negatif', () => {
    expect(realIndex(13, 5)).toBe(3);
    expect(realIndex(-1, 5)).toBe(4);
    expect(realIndex(0, 0)).toBe(0);
  });

  it('item track sama dengan items[realIndex]', () => {
    const items = ['a', 'b', 'c', 'd'];
    const track = buildLoopTrack(items, 4);
    track.forEach((item, i) => expect(item).toBe(items[realIndex(i, items.length)]));
  });
});

describe('normalizeLoopIndex', () => {
  it('melompat dari ujung salinan tengah kembali ke awal tanpa ganti item', () => {
    // count 10, start 10: setelah maju dari 19 → 20 harus kembali ke 10
    expect(normalizeLoopIndex(20, 10, 4)).toBe(10);
    // mundur dari 10 → 9 harus ke 19
    expect(normalizeLoopIndex(9, 10, 4)).toBe(19);
    // indeks di salinan tengah tidak berubah
    expect(normalizeLoopIndex(15, 10, 4)).toBe(15);
  });

  it('menangani beberapa langkah cepat beruntun', () => {
    expect(normalizeLoopIndex(6 + 3 * 4, 3, 4)).toBe(6);
  });

  it('selalu 0 untuk item ≤ 1', () => {
    expect(normalizeLoopIndex(5, 1, 4)).toBe(0);
  });
});

describe('swipeStep', () => {
  it('geser ke kiri melewati ambang = maju, ke kanan = mundur', () => {
    expect(swipeStep(-80, 50)).toBe(1);
    expect(swipeStep(80, 50)).toBe(-1);
  });

  it('geser kecil di bawah ambang diabaikan', () => {
    expect(swipeStep(-20, 50)).toBe(0);
    expect(swipeStep(49, 50)).toBe(0);
  });
});

describe('gallery.module.css', () => {
  it('track tanpa padding agar flex-basis % dan translate % memakai acuan lebar yang sama', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(
      `${process.cwd()}/src/app/darmasaba/_com/main-page/layanan-potensi/gallery.module.css`,
      'utf8',
    );
    const trackRule = css.match(/\n\.track \{([^}]*)\}/)?.[1] ?? '';
    expect(trackRule).toContain('display: flex');
    expect(trackRule).not.toMatch(/padding/);
  });
});

describe('reduceWheel', () => {
  const run = (events: Array<[number, number]>) => {
    let state = INITIAL_WHEEL_STATE;
    const steps: number[] = [];
    for (const [dx, t] of events) {
      const r = reduceWheel(state, dx, t, 40, 160);
      state = r.state;
      if (r.step) steps.push(r.step);
    }
    return steps;
  };

  it('jari ke kiri (deltaX positif) melewati ambang = maju 1 kartu', () => {
    expect(run([[15, 0], [15, 16], [15, 32]])).toEqual([1]);
  });

  it('jari ke kanan = mundur', () => {
    expect(run([[-25, 0], [-25, 16]])).toEqual([-1]);
  });

  it('momentum setelah langkah tidak menambah kartu selama event masih beruntun', () => {
    const events: Array<[number, number]> = Array.from({ length: 60 }, (_, i) => [30, i * 16]);
    expect(run(events)).toEqual([1]);
  });

  it('gerakan baru setelah jeda hening bisa maju lagi', () => {
    expect(run([[50, 0], [20, 16], [50, 400]])).toEqual([1, 1]);
  });

  // Pola mirip trackpad macOS: jari mempercepat, lalu momentum melemah setelah jari diangkat.
  const swipe = (sign: 1 | -1) => [2, 6, 14, 24, 30, 28].map((d) => d * sign);
  const momentum = (sign: 1 | -1) => [26, 22, 18, 15, 12, 9, 7, 5, 3, 2, 1].map((d) => d * sign);
  const timeline = (...deltas: number[][]): Array<[number, number]> =>
    deltas.flat().map((d, i) => [d, i * 16]);

  it('geser kedua langsung saat momentum geser pertama masih berjalan tetap maju', () => {
    expect(run(timeline(swipe(1), momentum(1), swipe(1)))).toEqual([1, 1]);
  });

  it('geser kedua memotong momentum yang masih kuat (gerak tiba-tiba > 2x) tetap maju', () => {
    expect(run(timeline(swipe(1), [26, 22, 18], [40, 44]))).toEqual([1, 1]);
  });

  it('berbalik arah di tengah momentum = mundur', () => {
    expect(run(timeline(swipe(1), [26, 22], swipe(-1)))).toEqual([1, -1]);
  });

  it('momentum yang melemah sampai habis tidak menambah kartu', () => {
    expect(run(timeline(swipe(1), momentum(1)))).toEqual([1]);
  });

  it('tiga geser beruntun tanpa jeda = tiga kartu', () => {
    expect(run(timeline(swipe(1), momentum(1), swipe(1), momentum(1), swipe(1)))).toEqual([1, 1, 1]);
  });

  it('geser kecil di bawah ambang diabaikan dan direset setelah jeda', () => {
    expect(run([[30, 0], [30, 500]])).toEqual([]);
  });
});

describe('dotCenterX', () => {
  it('titik aktif di tengah, tetangga simetris', () => {
    expect(dotCenterX(0)).toBe(0);
    expect(dotCenterX(1)).toBe(DOT.activeWidth / 2 + DOT.gap + DOT.size / 2);
    expect(dotCenterX(-1)).toBe(-dotCenterX(1));
  });

  it('jarak antar titik biasa konstan (ukuran + gap)', () => {
    expect(dotCenterX(2) - dotCenterX(1)).toBe(DOT.size + DOT.gap);
  });

  it('jendela 5 titik: 2 di tiap sisi titik aktif', () => {
    expect(DOT_WINDOW * 2 + 1).toBe(5);
  });
});
