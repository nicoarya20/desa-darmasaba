// @vitest-environment node
// Detail lowongan kerja publik: baca respons API (404 = tidak ditemukan), saring nonaktif (deletedAt sengaja
// diabaikan), teks kaya tersanitasi / paragraf teks polos, kontak Telepon/WhatsApp, tautan peta, sumber data.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import sanitizeHtml from 'sanitize-html';

// DOMPurify butuh DOM (tidak ada di node env): diganti sanitize-html dengan allowlist yang sama, supaya
// pembuangan <script>/atribut benar-benar terjadi, bukan sekadar stub.
const sanitize = vi.hoisted(() => vi.fn());
vi.mock('dompurify', () => ({ default: { sanitize } }));

const { detailGet, lowongankerja } = vi.hoisted(() => {
  const detailGet = vi.fn();
  return { detailGet, lowongankerja: vi.fn(() => ({ get: detailGet })) };
});
vi.mock('@/lib/api-fetch', () => ({ default: { api: { ekonomi: { lowongankerja } } } }));

import {
  isLowonganTampil,
  readDetailLowongan,
  toLowonganDetail,
  toRichText,
  type LowonganDetailApiItem,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/lowongan-detail.adapter.logic';
import {
  GOOGLE_MAPS_SEARCH_URL,
  buildLamaranMessage,
  petaHref,
  toLowonganKontak,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/lowongan-detail.contact.logic';
import { loadLowonganDetail } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/lowongan-detail.source';

// test-only: bentuk item findUnique stg (deletedAt = createdAt karena @default(now())).
const api = (over: Partial<LowonganDetailApiItem> = {}): LowonganDetailApiItem => ({
  id: 'low-1',
  posisi: ' Kasir ',
  namaPerusahaan: 'Toko Sari',
  lokasi: 'Jl. Raya Darmasaba No. 5',
  tipePekerjaan: 'Full Time',
  gaji: '2.500.000',
  deskripsi: '<p>Melayani <strong>pembeli</strong></p>',
  kualifikasi: '<ul><li><p>Usia max 30</p></li></ul>',
  notelp: '081916723298',
  tanggalPosting: '2026-07-14T04:01:55.661Z',
  createdAt: '2026-07-14T04:01:55.661Z',
  isActive: true,
  deletedAt: '2026-07-14T04:01:55.661Z',
  ...over,
});

const NOT_FOUND = { success: false, message: 'Lowongan kerja tidak ditemukan' };

beforeEach(() => {
  sanitize.mockReset();
  sanitize.mockImplementation((html: string, opts: { ALLOWED_TAGS: string[] }) =>
    sanitizeHtml(html, { allowedTags: opts.ALLOWED_TAGS, allowedAttributes: {} }),
  );
  detailGet.mockReset();
  lowongankerja.mockClear();
});

describe('readDetailLowongan', () => {
  it('200 + success + data → item', () => {
    const item = api();
    expect(readDetailLowongan('low-1', 200, { success: true, data: item })).toBe(item);
  });

  it('404 "tidak ditemukan" → null', () => {
    expect(readDetailLowongan('x', 404, NOT_FOUND)).toBeNull();
  });

  it('500 → Error berkonteks id + status + pesan', () => {
    expect(() => readDetailLowongan('low-1', 500, { success: false, message: 'Gagal mengambil lowongan kerja: db' })).toThrow(
      'Detail lowongan kerja low-1 gagal (HTTP 500): Gagal mengambil lowongan kerja: db',
    );
  });

  it('404 tanpa pesan tak ditemukan dan 200 tanpa data → Error (bukan notFound diam-diam)', () => {
    expect(() => readDetailLowongan('x', 404, null)).toThrow('HTTP 404');
    expect(() => readDetailLowongan('x', 200, { success: true, data: null })).toThrow('respons tidak valid');
  });
});

describe('isLowonganTampil', () => {
  it('nonaktif → tidak tampil', () => {
    expect(isLowonganTampil({ isActive: false })).toBe(false);
  });

  it('deletedAt terisi + isActive true → tetap tampil (deletedAt @default(now()), bukan penanda hapus)', () => {
    expect(isLowonganTampil(api({ deletedAt: '2026-07-14T04:01:55.661Z', isActive: true }))).toBe(true);
  });

  it('isActive kosong = aktif (bawaan schema)', () => {
    expect(isLowonganTampil({ isActive: null })).toBe(true);
    expect(isLowonganTampil({})).toBe(true);
  });
});

describe('toRichText', () => {
  it('HTML berbahaya dibuang: <script> beserta isinya, atribut onerror, tag di luar allowlist', () => {
    const rich = toRichText('<p onclick="x()">Aman</p><script>alert(1)</script><img src=x onerror="alert(2)">');
    expect(rich).toEqual({ kind: 'html', html: '<p>Aman</p>' });
  });

  it('HTML tiptap dipertahankan (p, ul > li > p, strong)', () => {
    expect(toRichText('<ul><li><p>Usia <strong>max</strong> 30</p></li></ul>')).toEqual({
      kind: 'html',
      html: '<ul><li><p>Usia <strong>max</strong> 30</p></li></ul>',
    });
  });

  it('"<p></p>", kosong, spasi, null → null', () => {
    expect(toRichText('<p></p>')).toBeNull();
    expect(toRichText('')).toBeNull();
    expect(toRichText('  \n ')).toBeNull();
    expect(toRichText(null)).toBeNull();
  });

  it('HTML yang hanya berisi tag berbahaya → null (tanpa section kosong)', () => {
    expect(toRichText('<p><script>alert(1)</script></p>')).toBeNull();
  });

  it('teks polos → paragraf per baris tak kosong, tanpa innerHTML', () => {
    expect(toRichText('Minimal SMA/SMK\r\n\n  komunikasi baik  \n')).toEqual({
      kind: 'text',
      paragraphs: ['Minimal SMA/SMK', 'komunikasi baik'],
    });
    expect(sanitize).not.toHaveBeenCalled();
  });

  it('teks polos berisi "<" tanpa tag tetap teks polos', () => {
    expect(toRichText('Usia < 30 tahun')).toEqual({ kind: 'text', paragraphs: ['Usia < 30 tahun'] });
  });
});

describe('toLowonganKontak', () => {
  const o = { pemberiKerja: 'Toko Sari', posisi: 'Kasir' };

  it('nomor seluler → Telepon + WhatsApp berpesan', () => {
    const kontak = toLowonganKontak('0819-1672-3298', o);
    expect(kontak?.display).toBe('0819 1672 3298');
    expect(kontak?.telHref).toBe('tel:+6281916723298');
    expect(kontak?.waHref).toBe(
      `https://wa.me/6281916723298?text=${encodeURIComponent(
        'Halo Toko Sari, saya tertarik dengan lowongan Kasir yang saya lihat di website Desa Darmasaba.',
      )}`,
    );
  });

  it('nomor kantor 0361 → Telepon saja (waHref null)', () => {
    expect(toLowonganKontak('(0361) 846-3263', o)).toEqual({
      display: '(0361) 846 3263',
      telHref: 'tel:+623618463263',
      waHref: null,
    });
  });

  it('kosong, tanpa digit, atau nomor pendek → null', () => {
    expect(toLowonganKontak('', o)).toBeNull();
    expect(toLowonganKontak('-', o)).toBeNull();
    expect(toLowonganKontak('123', o)).toBeNull();
    expect(toLowonganKontak(undefined, o)).toBeNull();
  });

  it('pesan tanpa pemberi kerja → "Halo,"', () => {
    expect(buildLamaranMessage({ pemberiKerja: ' ', posisi: 'Kasir' })).toBe(
      'Halo, saya tertarik dengan lowongan Kasir yang saya lihat di website Desa Darmasaba.',
    );
  });
});

describe('petaHref', () => {
  it('alamat → pencarian Google Maps ter-encode; kosong → null', () => {
    expect(petaHref(' Jl. Raya Darmasaba No. 5 ')).toBe(`${GOOGLE_MAPS_SEARCH_URL}Jl.%20Raya%20Darmasaba%20No.%205`);
    expect(petaHref('')).toBeNull();
    expect(petaHref(null)).toBeNull();
  });
});

describe('toLowonganDetail', () => {
  it('gaji "2.500.000" → 2500000 (bukan NaN), plus teks kaya, kontak, dan peta', () => {
    const d = toLowonganDetail(api());
    expect(d.gaji).toBe(2500000);
    expect(d.posisi).toBe('Kasir');
    expect(d.diDesa).toBe(true);
    expect(d.deskripsi).toEqual({ kind: 'html', html: '<p>Melayani <strong>pembeli</strong></p>' });
    expect(d.kualifikasi).toEqual({ kind: 'html', html: '<ul><li><p>Usia max 30</p></li></ul>' });
    expect(d.kontak?.waHref).toContain(encodeURIComponent('lowongan Kasir'));
    expect(d.petaHref).toBe(`${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent('Jl. Raya Darmasaba No. 5')}`);
  });

  it('lokasi & notelp kosong → petaHref & kontak null', () => {
    const d = toLowonganDetail(api({ lokasi: ' ', notelp: '' }));
    expect(d.petaHref).toBeNull();
    expect(d.kontak).toBeNull();
  });
});

describe('loadLowonganDetail', () => {
  it('memanggil endpoint :id dan mengembalikan detail', async () => {
    detailGet.mockResolvedValue({ status: 200, data: { success: true, data: api() }, error: null });
    const d = await loadLowonganDetail('low-1');
    expect(lowongankerja).toHaveBeenCalledWith({ id: 'low-1' });
    expect(d?.id).toBe('low-1');
  });

  it('404 (badan di error.value, gaya Eden) → null', async () => {
    detailGet.mockResolvedValue({ status: 404, data: null, error: { status: 404, value: NOT_FOUND } });
    await expect(loadLowonganDetail('ngawur')).resolves.toBeNull();
  });

  it('nonaktif → null; deletedAt terisi + aktif → tampil', async () => {
    detailGet.mockResolvedValue({ status: 200, data: { success: true, data: api({ isActive: false }) }, error: null });
    await expect(loadLowonganDetail('low-1')).resolves.toBeNull();
    detailGet.mockResolvedValue({ status: 200, data: { success: true, data: api() }, error: null });
    await expect(loadLowonganDetail('low-1')).resolves.not.toBeNull();
  });

  it('500 → Error berkonteks', async () => {
    detailGet.mockResolvedValue({ status: 500, data: null, error: { status: 500, value: { success: false, message: 'db mati' } } });
    await expect(loadLowonganDetail('low-1')).rejects.toThrow('Detail lowongan kerja low-1 gagal (HTTP 500): db mati');
  });
});
