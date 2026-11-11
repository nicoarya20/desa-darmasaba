// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  parseSkor,
  pickTopSdgs,
  readSdgsList,
  type SdgsApiItem,
} from '@/app/(public)/_com/main-page/sdgs/sdgs.logic';

// test-only: bentuk meniru respons /api/landingpage/sdgsdesa/findMany.
const item = (id: string, jumlah: string | null | undefined, over: Partial<SdgsApiItem> = {}): SdgsApiItem => ({
  id,
  name: `  Tujuan ${id}  `,
  jumlah,
  image: { link: `/api/img/${id}.webp` },
  ...over,
});

describe('parseSkor', () => {
  it('membaca desimal titik dan koma', () => {
    expect(parseSkor('99.64')).toBe(99.64);
    expect(parseSkor('52,62')).toBe(52.62);
    expect(parseSkor(' 0.00 ')).toBe(0);
  });

  it('kosong/null/teks bukan angka → null', () => {
    expect(parseSkor('')).toBeNull();
    expect(parseSkor('   ')).toBeNull();
    expect(parseSkor(null)).toBeNull();
    expect(parseSkor(undefined)).toBeNull();
    expect(parseSkor('n/a')).toBeNull();
    expect(parseSkor('12abc')).toBeNull();
  });
});

describe('readSdgsList', () => {
  it('menerima { data: [] } atau array langsung', () => {
    const list = [item('a', '1')];
    expect(readSdgsList({ success: true, data: list })).toBe(list);
    expect(readSdgsList(list)).toBe(list);
  });

  it('bentuk lain → array kosong', () => {
    expect(readSdgsList(null)).toEqual([]);
    expect(readSdgsList(undefined)).toEqual([]);
    expect(readSdgsList({ success: false, message: 'gagal' })).toEqual([]);
    expect(readSdgsList({ data: 'bukan array' })).toEqual([]);
  });
});

describe('pickTopSdgs', () => {
  it('mengambil 4 skor tertinggi, urut menurun, desimal ikut dihitung', () => {
    const top = pickTopSdgs(
      [item('a', '35.37'), item('b', '99.64'), item('c', '35.75'), item('d', '77.37'), item('e', '35.47'), item('f', '0.00')],
      4,
    );
    expect(top.map((t) => t.id)).toEqual(['b', 'd', 'c', 'e']);
  });

  it('item tanpa skor valid/kosong dibuang', () => {
    const top = pickTopSdgs([item('a', ''), item('b', '40'), item('c', null), item('d', 'abc'), item('e', '45,70')], 4);
    expect(top.map((t) => t.id)).toEqual(['e', 'b']);
  });

  it('data kurang dari limit → semua tampil; kosong → []', () => {
    expect(pickTopSdgs([item('a', '10'), item('b', '20')], 4).map((t) => t.id)).toEqual(['b', 'a']);
    expect(pickTopSdgs([], 4)).toEqual([]);
  });

  it('skor sama mempertahankan urutan asal', () => {
    expect(pickTopSdgs([item('a', '50.00'), item('b', '50'), item('c', '50,0')], 4).map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('normalisasi: nama & label skor di-trim, label apa adanya, tanpa gambar → imageUrl undefined', () => {
    const [first, second] = pickTopSdgs([item('a', ' 52,62 '), item('b', '10', { image: null })], 4);
    expect(first).toEqual({ id: 'a', name: 'Tujuan a', skorLabel: '52,62', skor: 52.62, imageUrl: '/api/img/a.webp' });
    expect(second.imageUrl).toBeUndefined();
  });
});
