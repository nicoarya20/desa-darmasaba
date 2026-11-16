// @vitest-environment node
// Info Teknologi Tepat Guna publik: pemetaan entri (isi dibersihkan), URL daftar, pemuat API.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { inovasi: { infotekno: { 'find-many': { get: findMany } } } } },
}));

const { infoTtgListHref, toTtg } = await import(
  '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.logic'
);
const { loadInfoTtgPage } = await import('@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.source');

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const entri = {
  id: 'cmttg1',
  name: ' Alat Penetas Telur Otomatis ',
  deskripsi: '<p><strong>Teknologi yang membantu peternak</strong> meningkatkan keberhasilan penetasan telur.</p>',
  image: { link: '/api/img/ju88lwn0m2UVzamfyzr78-desktop.webp' },
};
const identity = (html: string) => html;

describe('toTtg', () => {
  it('judul dirapikan, isi lewat sanitize, foto dari image.link', () => {
    const sanitize = vi.fn(identity);
    expect(toTtg(entri, sanitize)).toEqual({
      id: 'cmttg1',
      title: 'Alat Penetas Telur Otomatis',
      html: entri.deskripsi,
      imageUrl: '/api/img/ju88lwn0m2UVzamfyzr78-desktop.webp',
    });
    expect(sanitize).toHaveBeenCalledWith(entri.deskripsi);
  });

  it('isi kosong/null → tanpa html dan sanitize tidak dipanggil; tanpa foto → tanpa imageUrl (bukan placeholder)', () => {
    const sanitize = vi.fn(identity);
    const t = toTtg({ ...entri, deskripsi: null, image: { link: '  ' } }, sanitize);
    expect(t.html).toBeUndefined();
    expect(t.imageUrl).toBeUndefined();
    expect(sanitize).not.toHaveBeenCalled();
    expect(toTtg({ ...entri, image: null }, identity).imageUrl).toBeUndefined();
  });

  it('HTML tanpa teks ("<p></p>", "&nbsp;") → tanpa html, walau sanitize meloloskannya', () => {
    const sanitize = vi.fn(identity);
    expect(toTtg({ ...entri, deskripsi: '<p></p>' }, sanitize).html).toBeUndefined();
    expect(toTtg({ ...entri, deskripsi: '<p>&nbsp;</p><p> </p>' }, sanitize).html).toBeUndefined();
    expect(sanitize).not.toHaveBeenCalled();
  });

  it('sanitize mengembalikan "" → tanpa html', () => {
    expect(toTtg(entri, () => '').html).toBeUndefined();
  });

  it('sanitize bawaan (DOMPurify) di lingkungan tanpa DOM → tidak merender HTML mentah', () => {
    expect(toTtg({ ...entri, deskripsi: '<img src=x onerror=alert(1)>' }).html).toBeUndefined();
  });
});

// Ambang kolom cari memakai helper bersama `listSearchable` (diuji di inovasi_kolaborasi_logic.test.ts).
describe('infoTtgListHref', () => {
  it('halaman 1 & kata kunci kosong tidak ditulis ke query', () => {
    expect(infoTtgListHref()).toBe('/inovasi/info-teknologi-tepat-guna');
    expect(infoTtgListHref({ search: 'telur', page: 2 })).toBe('/inovasi/info-teknologi-tepat-guna?search=telur&page=2');
  });
});

describe('loadInfoTtgPage', () => {
  beforeEach(() => findMany.mockReset());

  it('meneruskan page/limit/search; total & totalPages dari respons', async () => {
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: [entri], totalPages: 2, total: 11 } });
    const res = await loadInfoTtgPage({ page: 2, limit: 10, search: 'telur' });
    expect(findMany).toHaveBeenCalledWith({ query: { page: 2, limit: 10, search: 'telur' } });
    expect(res.totalPages).toBe(2);
    expect(res.total).toBe(11);
    expect(res.items.map((i) => i.title)).toEqual(['Alat Penetas Telur Otomatis']);
  });

  it('tanpa kata kunci → search tidak dikirim; total tak valid → jumlah entri', async () => {
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: [entri] } });
    const res = await loadInfoTtgPage({ page: 1, limit: 10, search: '' });
    expect(findMany).toHaveBeenCalledWith({ query: { page: 1, limit: 10 } });
    expect(res).toMatchObject({ totalPages: 1, total: 1 });
  });

  it('respons gagal → Error berkonteks', async () => {
    findMany.mockResolvedValue({ status: 500, data: { success: false, message: 'Failed fetch' } });
    await expect(loadInfoTtgPage({ page: 1, limit: 10, search: '' })).rejects.toThrow(
      'find-many info teknologi tepat guna gagal (HTTP 500): Failed fetch',
    );
  });
});
