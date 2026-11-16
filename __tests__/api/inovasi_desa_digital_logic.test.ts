// @vitest-environment node
// Desa Digital publik: normalisasi item, URL daftar/detail, susunan sorotan + kartu + paginasi klien.
import { describe, expect, it } from 'vitest';
import {
  arrangeDesaDigital,
  desaDigitalDetailHref,
  desaDigitalListHref,
  toDesaDigitalItem,
  type DesaDigitalItem,
} from '@/app/(public)/(pages)/inovasi/desa-digital-smart-village/_com/desa-digital.logic';

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = (i: number) => ({
  id: `dd${i}`,
  name: `  Layanan ${i}  `,
  deskripsi: `<p>Aplikasi &amp; layanan ${i}</p><p>baris dua</p>`,
  createdAt: '2026-01-20T03:00:00.000Z',
  image: { link: `/api/img/dd${i}.webp` },
});
const items = (n: number): DesaDigitalItem[] => Array.from({ length: n }, (_, i) => toDesaDigitalItem(api(i + 1)));

describe('toDesaDigitalItem', () => {
  it('judul dirapikan, ringkasan teks polos dari HTML, foto & tautan detail', () => {
    expect(toDesaDigitalItem(api(1))).toEqual({
      id: 'dd1',
      title: 'Layanan 1',
      summary: 'Aplikasi & layanan 1 baris dua',
      imageUrl: '/api/img/dd1.webp',
      href: '/inovasi/desa-digital-smart-village/dd1',
    });
  });

  it('tanpa foto / deskripsi kosong → tanpa imageUrl, ringkasan kosong', () => {
    const item = toDesaDigitalItem({ ...api(2), image: null, deskripsi: null });
    expect(item.imageUrl).toBeUndefined();
    expect(item.summary).toBe('');
    expect(toDesaDigitalItem({ ...api(3), image: { link: '' } }).imageUrl).toBeUndefined();
  });
});

describe('URL', () => {
  it('detail meng-encode id; daftar menulis search/page hanya bila perlu', () => {
    expect(desaDigitalDetailHref('a/b')).toBe('/inovasi/desa-digital-smart-village/a%2Fb');
    expect(desaDigitalListHref()).toBe('/inovasi/desa-digital-smart-village');
    expect(desaDigitalListHref({ search: ' app ', page: 1 })).toBe('/inovasi/desa-digital-smart-village?search=app');
    expect(desaDigitalListHref({ page: 2 })).toBe('/inovasi/desa-digital-smart-village?page=2');
  });
});

describe('arrangeDesaDigital', () => {
  it('tanpa kata kunci: entri pertama jadi sorotan, sisanya kartu (halaman 1 = 1 + 6)', () => {
    const view = arrangeDesaDigital(items(8), { search: '', page: 1, size: 6 });
    expect(view.sorotan?.id).toBe('dd1');
    expect(view.cards.map((c) => c.id)).toEqual(['dd2', 'dd3', 'dd4', 'dd5', 'dd6', 'dd7']);
    expect(view.totalPages).toBe(2);
  });

  it('halaman 2: tanpa sorotan, sorotan tidak muncul lagi sebagai kartu', () => {
    const view = arrangeDesaDigital(items(8), { search: '', page: 2, size: 6 });
    expect(view.sorotan).toBeUndefined();
    expect(view.cards.map((c) => c.id)).toEqual(['dd8']);
    expect(view.page).toBe(2);
  });

  it('dengan kata kunci: tanpa sorotan, semua hasil jadi kartu', () => {
    const view = arrangeDesaDigital(items(3), { search: 'app', page: 1, size: 6 });
    expect(view.sorotan).toBeUndefined();
    expect(view.cards).toHaveLength(3);
  });

  it('1 entri: sorotan saja; halaman di luar jangkauan → halaman terakhir', () => {
    const one = arrangeDesaDigital(items(1), { search: '', page: 1, size: 6 });
    expect(one.sorotan?.id).toBe('dd1');
    expect(one.cards).toEqual([]);
    const far = arrangeDesaDigital(items(8), { search: '', page: 9, size: 6 });
    expect(far.page).toBe(2);
    expect(far.sorotan).toBeUndefined();
  });

  it('kosong: tanpa sorotan, tanpa kartu, 1 halaman', () => {
    expect(arrangeDesaDigital([], { search: '', page: 1, size: 6 })).toEqual({ sorotan: undefined, cards: [], page: 1, totalPages: 1 });
  });
});
