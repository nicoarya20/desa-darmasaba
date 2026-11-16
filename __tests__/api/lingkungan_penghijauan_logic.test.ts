// @vitest-environment node
// Program Penghijauan publik: normalisasi ubin (ikon tak dikenal → tanpa ikon), cari klien, URL, detail, "tidak ditemukan".
import { describe, expect, it } from 'vitest';
import {
  filterPenghijauan,
  isNotFoundMessage,
  penghijauanDetailHref,
  penghijauanEmptyMessage,
  penghijauanListHref,
  toPenghijauan,
  toPenghijauanDetail,
} from '@/app/(public)/(pages)/lingkungan/program-penghijauan/_com/penghijauan.logic';

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = {
  id: 'cmkmdp3zg0000vn8isspu3gi0',
  name: ' Taman Hijau Bersama ',
  judul: ' Pembangunan Taman Hijau Desa ',
  deskripsi: '<p>Pembangunan taman hijau di beberapa titik strategis desa, melibatkan banjar adat.</p>',
  icon: 'pohon',
};
const identity = (html: string) => html;

describe('toPenghijauan', () => {
  it('nama → judul ubin, judul admin → ringkasan, ikon dikenal, tautan detail', () => {
    const item = toPenghijauan(api);
    expect(item).toMatchObject({
      id: api.id,
      title: 'Taman Hijau Bersama',
      summary: 'Pembangunan Taman Hijau Desa',
      icon: 'pohon',
      href: '/lingkungan/program-penghijauan/cmkmdp3zg0000vn8isspu3gi0',
    });
  });

  it('ikon kosong / tak dikenal ("icon-test", "toString") → tanpa ikon; judul kosong → ringkasan kosong', () => {
    for (const icon of ['', '  ', 'icon-test', 'toString', null]) {
      expect(toPenghijauan({ ...api, icon }).icon).toBeUndefined();
    }
    expect(toPenghijauan({ ...api, judul: null }).summary).toBe('');
  });
});

describe('filterPenghijauan', () => {
  const items = [
    toPenghijauan(api),
    toPenghijauan({ ...api, id: 'b', name: 'Komunitas Tanam Pohon', judul: 'Gerakan warga', deskripsi: '<p>Area perbukitan</p>' }),
  ];

  it('semua kata harus muncul di nama, judul, atau teks deskripsi; tidak peka huruf besar', () => {
    expect(filterPenghijauan(items, 'TANAM pohon').map((i) => i.id)).toEqual(['b']);
    expect(filterPenghijauan(items, 'perbukitan').map((i) => i.id)).toEqual(['b']);
    expect(filterPenghijauan(items, 'banjar taman').map((i) => i.id)).toEqual([api.id]);
    expect(filterPenghijauan(items, '  ')).toHaveLength(2);
    expect(filterPenghijauan(items, 'zzz')).toEqual([]);
  });

  it('tag HTML deskripsi tidak ikut dicari', () => {
    expect(filterPenghijauan(items, '<p>')).toEqual([]);
  });
});

describe('URL', () => {
  it('detail meng-encode id; daftar menulis search/page hanya bila perlu', () => {
    expect(penghijauanDetailHref('a/b')).toBe('/lingkungan/program-penghijauan/a%2Fb');
    expect(penghijauanListHref()).toBe('/lingkungan/program-penghijauan');
    expect(penghijauanListHref({ search: ' pohon ', page: 1 })).toBe('/lingkungan/program-penghijauan?search=pohon');
    expect(penghijauanListHref({ search: 'pohon', page: 2 })).toBe('/lingkungan/program-penghijauan?search=pohon&page=2');
  });
});

describe('toPenghijauanDetail', () => {
  it('judul h1 = nama, pengantar = judul admin, isi HTML lewat sanitize', () => {
    const seen: string[] = [];
    const detail = toPenghijauanDetail(api, (html) => (seen.push(html), html.replace('banjar', 'BANJAR')));
    expect(detail).toEqual({
      title: 'Taman Hijau Bersama',
      lead: 'Pembangunan Taman Hijau Desa',
      html: '<p>Pembangunan taman hijau di beberapa titik strategis desa, melibatkan BANJAR adat.</p>',
    });
    expect(seen).toEqual([api.deskripsi]);
  });

  it('judul / deskripsi kosong → bagian tidak ada (tanpa teks cadangan)', () => {
    const detail = toPenghijauanDetail({ ...api, judul: ' ', deskripsi: '' }, identity);
    expect(detail.lead).toBeUndefined();
    expect(detail.html).toBeUndefined();
    // sanitize mengembalikan "" (mis. "<p></p>" atau isi ditolak) → tanpa isi.
    expect(toPenghijauanDetail(api, () => '').html).toBeUndefined();
  });
});

describe('pesan & tidak ditemukan', () => {
  it('pesan kosong: galat, cari tanpa hasil, belum ada', () => {
    expect(penghijauanEmptyMessage('', true)).toBe('Program penghijauan gagal dimuat. Coba muat ulang halaman.');
    expect(penghijauanEmptyMessage(' pohon ', false)).toBe('Tidak ada program penghijauan yang cocok dengan “pohon”.');
    expect(penghijauanEmptyMessage('', false)).toBe('Belum ada program penghijauan.');
  });

  it('hanya pesan "tidak ditemukan" API detail yang berarti 404', () => {
    expect(isNotFoundMessage('Program penghijauan tidak ditemukan')).toBe(true);
    expect(isNotFoundMessage('Gagal mengambil data program penghijauan')).toBe(false);
    expect(isNotFoundMessage(undefined)).toBe(false);
  });
});
