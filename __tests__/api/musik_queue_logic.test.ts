// @vitest-environment node
// Urutan putar (acak Fisher-Yates, lagu saat ini di depan), "Berikutnya" melingkar, dan riwayat
// "Baru diputar" (unik, maks 20, terbaru dulu, JSON rusak → []).
import { describe, expect, it, vi } from 'vitest';
import {
  buildShuffledOrder,
  computeUpNext,
  reconcileOrder,
  resolveIds,
  shuffleIds,
} from '@/app/context/music/musicQueue';
import {
  RECENT_MAX,
  RECENT_STORAGE_KEY,
  parseRecentIds,
  pushRecentId,
  readRecentIds,
  writeRecentIds,
} from '@/app/context/music/recentlyPlayed';

const LIB = ['a', 'b', 'c', 'd', 'e'];

/** RNG deterministik: mengembalikan nilai berurutan dari daftar (melingkar). test-only */
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('shuffleIds (Fisher-Yates)', () => {
  it('permutasi lengkap tanpa mengubah masukan', () => {
    const input = [...LIB];
    const out = shuffleIds(input, seq(0.3, 0.9, 0.1, 0.6));
    expect([...out].sort()).toEqual(LIB);
    expect(input).toEqual(LIB);
  });

  it('memakai RNG yang disuntik (random 0 → geser tiap elemen ke depan)', () => {
    // i=4 tukar 0, i=3 tukar 0, i=2 tukar 0, i=1 tukar 0
    expect(shuffleIds(['a', 'b', 'c', 'd', 'e'], () => 0)).toEqual(['b', 'c', 'd', 'e', 'a']);
  });

  it('random mendekati 1 → urutan tetap', () => {
    expect(shuffleIds(LIB, () => 0.999)).toEqual(LIB);
  });
});

describe('buildShuffledOrder', () => {
  it('lagu saat ini tetap di depan, sisanya permutasi lengkap', () => {
    const order = buildShuffledOrder(LIB, 'c', () => 0);
    expect(order[0]).toBe('c');
    expect(order).toHaveLength(LIB.length);
    expect([...order].sort()).toEqual(LIB);
    expect(order).toEqual(['c', 'b', 'd', 'e', 'a']);
  });

  it('tanpa lagu saat ini / id tak dikenal → seluruh pustaka diacak', () => {
    expect(buildShuffledOrder(LIB, null, () => 0)).toEqual(['b', 'c', 'd', 'e', 'a']);
    expect(buildShuffledOrder(LIB, 'zzz', () => 0)).toEqual(['b', 'c', 'd', 'e', 'a']);
  });

  it('memanggil Math.random bila RNG tidak disuntik', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect(buildShuffledOrder(LIB, 'e')).toEqual(['e', 'a', 'b', 'c', 'd']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('reconcileOrder', () => {
  it('membuang id yang hilang dan menambah id baru di belakang tanpa mengacak ulang', () => {
    expect(reconcileOrder(['c', 'x', 'a', 'b'], ['a', 'b', 'c', 'd'])).toEqual(['c', 'a', 'b', 'd']);
  });
});

describe('computeUpNext', () => {
  it('melingkar: setelah lagu saat ini sampai ujung, lalu dari awal sampai sebelum lagu saat ini', () => {
    expect(computeUpNext(LIB, 'c')).toEqual(['d', 'e', 'a', 'b']);
    expect(computeUpNext(LIB, 'e')).toEqual(['a', 'b', 'c', 'd']);
    expect(computeUpNext(LIB, 'a')).toEqual(['b', 'c', 'd', 'e']);
  });

  it('tanpa lagu saat ini (atau tak ada di urutan) → seluruh urutan', () => {
    expect(computeUpNext(LIB, null)).toEqual(LIB);
    expect(computeUpNext(LIB, 'zzz')).toEqual(LIB);
  });

  it('mematikan acak = urutan pustaka lagi, berikutnya mulai dari lagu saat ini', () => {
    const shuffled = buildShuffledOrder(LIB, 'b', () => 0.5);
    expect(shuffled).toEqual(['b', 'a', 'e', 'c', 'd']);
    expect(computeUpNext(shuffled, 'b')).toEqual(['a', 'e', 'c', 'd']);
    expect(computeUpNext(LIB, 'b')).toEqual(['c', 'd', 'e', 'a']);
  });
});

describe('resolveIds', () => {
  it('mempertahankan urutan id dan membuang id yang tidak ada di pustaka', () => {
    const lib = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }];
    expect(resolveIds(['b', 'x', 'a'], lib)).toEqual([{ id: 'b', n: 2 }, { id: 'a', n: 1 }]);
  });
});

describe('riwayat Baru diputar', () => {
  it('pushRecentId: terbaru di depan, unik', () => {
    expect(pushRecentId(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
    expect(pushRecentId([], 'a')).toEqual(['a']);
  });

  it(`pushRecentId: dipotong ke ${RECENT_MAX}`, () => {
    const ids = Array.from({ length: RECENT_MAX }, (_, i) => `s${i}`);
    const next = pushRecentId(ids, 'baru');
    expect(next).toHaveLength(RECENT_MAX);
    expect(next[0]).toBe('baru');
    expect(next).not.toContain(`s${RECENT_MAX - 1}`);
  });

  it('parseRecentIds: JSON rusak / bukan array / kosong → []', () => {
    expect(parseRecentIds('{rusak')).toEqual([]);
    expect(parseRecentIds('{"a":1}')).toEqual([]);
    expect(parseRecentIds(null)).toEqual([]);
    expect(parseRecentIds('')).toEqual([]);
  });

  it('parseRecentIds: hanya string, unik, maks 20, urutan dipertahankan', () => {
    expect(parseRecentIds(JSON.stringify(['a', 1, 'b', 'a', null, '']))).toEqual(['a', 'b']);
    const many = Array.from({ length: 30 }, (_, i) => `s${i}`);
    expect(parseRecentIds(JSON.stringify(many))).toEqual(many.slice(0, RECENT_MAX));
  });

  it('readRecentIds / writeRecentIds memakai kunci musik-desa:recent', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    writeRecentIds(['b', 'a'], () => storage);
    expect(RECENT_STORAGE_KEY).toBe('musik-desa:recent');
    expect(store.get(RECENT_STORAGE_KEY)).toBe('["b","a"]');
    expect(readRecentIds(() => storage)).toEqual(['b', 'a']);
  });

  it('storage tidak ada (SSR) → [] dan tulis tidak melempar', () => {
    expect(readRecentIds(() => null)).toEqual([]);
    expect(() => writeRecentIds(['a'], () => null)).not.toThrow();
  });

  it('storage melempar (mode privat / diblokir) → [] dengan peringatan, tanpa crash', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const blocked = () => {
      throw new Error('SecurityError');
    };
    expect(readRecentIds(blocked)).toEqual([]);
    expect(() => writeRecentIds(['a'], blocked)).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(String(warn.mock.calls[0][0])).toContain('SecurityError');
    warn.mockRestore();
  });

  it('readRecentIds di lingkungan tanpa window (bawaan) → []', () => {
    expect(readRecentIds()).toEqual([]);
  });
});
