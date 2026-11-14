// @vitest-environment node
// Aturan pustaka Musik Desa (audit 2026-11-14): arti klik lagu, urutan rak, kunci URL, teks tepi.
import { describe, expect, it } from 'vitest';
import { playIntent } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';

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
