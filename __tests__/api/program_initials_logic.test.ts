// @vitest-environment node
// Inisial nama Program Inovasi: pengganti logo di ubin bila gambar tidak ada / gagal dimuat.
import { describe, expect, it } from 'vitest';
import { programInitials } from '@/app/(public)/_com/program-tiles/program-initials.logic';

describe('programInitials', () => {
  it('2 kata atau lebih: huruf pertama 2 kata pertama, kapital', () => {
    expect(programInitials('Bicara Darmasaba')).toBe('BD');
    expect(programInitials('Sajjana Dharma Raksaka')).toBe('SD');
    expect(programInitials('inovasi desa')).toBe('ID');
  });

  it('1 kata kapital ≤4 huruf dipertahankan utuh', () => {
    expect(programInitials('PDKT')).toBe('PDKT');
    expect(programInitials('GM')).toBe('GM');
    expect(programInitials('A')).toBe('A');
  });

  it('1 kata lain: huruf pertama saja', () => {
    expect(programInitials('Davest')).toBe('D');
    expect(programInitials('davest')).toBe('D');
    // Kapital tapi lebih dari 4 huruf bukan singkatan pendek.
    expect(programInitials('SIMPEL')).toBe('S');
    // Campuran besar-kecil bukan singkatan.
    expect(programInitials('PdKt')).toBe('P');
  });

  it('spasi di tepi dan spasi ganda diabaikan', () => {
    expect(programInitials('  Bicara   Darmasaba  ')).toBe('BD');
    expect(programInitials(' PDKT ')).toBe('PDKT');
  });

  it('string kosong atau hanya spasi menghasilkan string kosong', () => {
    expect(programInitials('')).toBe('');
    expect(programInitials('   ')).toBe('');
  });
});
