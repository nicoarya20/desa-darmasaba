// @vitest-environment node
// Aturan pustaka Musik Desa (audit 2026-11-14): arti klik lagu, urutan rak, kunci URL, teks tepi.
import { describe, expect, it } from 'vitest';
import { playIntent } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';
import { EDGE_TOLERANCE, nextEdges } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/shelf-row.logic';

describe('playIntent', () => {
  it('lagu saat ini & bisa diputar → toggle', () => {
    expect(playIntent({ id: 'a', playable: true }, 'a')).toBe('toggle');
  });

  it('lagu lain, atau lagu tanpa audio (walau id sama) → play (diserahkan ke mesin)', () => {
    expect(playIntent({ id: 'b', playable: true }, 'a')).toBe('play');
    expect(playIntent({ id: 'a', playable: false }, 'a')).toBe('play');
    expect(playIntent({ id: 'a', playable: true }, null)).toBe('play');
  });
});

describe('nextEdges (rak gulir)', () => {
  const at = (scrollLeft: number) => ({ scrollLeft, clientWidth: 500, scrollWidth: 1200 });

  it('kiri / tengah / kanan, dengan toleransi subpiksel', () => {
    const prev = { start: false, end: false };
    expect(nextEdges(prev, at(EDGE_TOLERANCE))).toEqual({ start: true, end: false });
    expect(nextEdges(prev, at(300))).toBe(prev);
    expect(nextEdges(prev, at(700 - EDGE_TOLERANCE))).toEqual({ start: false, end: true });
  });

  it('nilai tidak berubah → objek lama yang sama (setState tidak merender ulang)', () => {
    const prev = { start: true, end: false };
    expect(nextEdges(prev, at(0))).toBe(prev);
    expect(nextEdges(prev, at(1))).toBe(prev);
  });

  it('isi lebih sempit dari rak → dua ujung sekaligus', () => {
    expect(nextEdges({ start: false, end: false }, { scrollLeft: 0, clientWidth: 800, scrollWidth: 800 })).toEqual({
      start: true,
      end: true,
    });
  });
});
