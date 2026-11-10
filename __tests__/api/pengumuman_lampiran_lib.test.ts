// @vitest-environment node
// Logika murni Pengumuman: tanggal terbit (WITA), normalisasi & batas lampiran, cek jenis berkas,
// dan bentuk data prisma create/update (field tidak dikirim = tidak diubah).
import { describe, expect, it } from 'vitest';
import {
  MAX_DOKUMEN_PENGUMUMAN,
  MAX_GALERI_PENGUMUMAN,
  PENGUMUMAN_DETAIL_INCLUDE,
  PENGUMUMAN_LIST_INCLUDE,
  PENGUMUMAN_LIST_ORDER_BY,
  parseLampiran,
  periksaBerkas,
  periksaIds,
  rujukanBerkas,
  susunDataCreate,
  susunDataUpdate,
  type PengumumanBody,
} from '@/lib/pengumuman-lampiran';
import {
  formatTanggalTerbit,
  hariIniInput,
  parseTanggalTerbit,
  tanggalKeInput,
  tanggalPengumuman,
} from '@/lib/pengumuman-tanggal';

// test-only: body minimal dengan field lama
const body = (over: Partial<PengumumanBody> = {}): PengumumanBody => ({
  judul: 'Lelang Tanah Kas Desa',
  deskripsi: 'Detail pada lampiran',
  content: '<p>-</p>',
  categoryPengumumanId: 'kat-1',
  ...over,
});
const ids = (n: number, p = 'f') => Array.from({ length: n }, (_, i) => `${p}${i}`);

describe('parseTanggalTerbit', () => {
  it('kosong/null/undefined → undefined (pakai default / tidak diubah)', () => {
    expect(parseTanggalTerbit(undefined)).toEqual({ ok: true, data: undefined });
    expect(parseTanggalTerbit(null)).toEqual({ ok: true, data: undefined });
    expect(parseTanggalTerbit('  ')).toEqual({ ok: true, data: undefined });
  });

  it('YYYY-MM-DD dibaca sebagai awal hari di WITA (UTC+8)', () => {
    const r = parseTanggalTerbit('2024-03-05');
    expect(r.ok && r.data?.toISOString()).toBe('2024-03-04T16:00:00.000Z');
  });

  it('ISO lengkap diterima apa adanya', () => {
    const r = parseTanggalTerbit('2023-12-01T10:15:00.000Z');
    expect(r.ok && r.data?.toISOString()).toBe('2023-12-01T10:15:00.000Z');
  });

  it('menolak teks acak, tanggal mustahil, dan non-string', () => {
    expect(parseTanggalTerbit('kemarin').ok).toBe(false);
    expect(parseTanggalTerbit('2026-02-31').ok).toBe(false);
    expect(parseTanggalTerbit(123).ok).toBe(false);
  });
});

describe('tanggal tampilan', () => {
  it('tanggalKeInput memakai kalender WITA (16:30Z = besoknya di WITA)', () => {
    expect(tanggalKeInput('2024-03-04T16:30:00.000Z')).toBe('2024-03-05');
    expect(tanggalKeInput(new Date('2024-03-04T15:59:00.000Z'))).toBe('2024-03-04');
    expect(hariIniInput(new Date('2026-11-10T20:00:00.000Z'))).toBe('2026-11-11');
  });

  it('tanggalPengumuman memakai tanggalTerbit, fallback createdAt', () => {
    expect(tanggalPengumuman({ tanggalTerbit: '2020-01-02T00:00:00.000Z', createdAt: '2026-01-01' }).toISOString()).toBe(
      '2020-01-02T00:00:00.000Z',
    );
    expect(tanggalPengumuman({ createdAt: '2026-01-01T00:00:00.000Z' }).toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('formatTanggalTerbit berbahasa Indonesia, opsional tanpa hari', () => {
    const d = new Date('2024-03-04T16:00:00.000Z'); // 5 Maret 2024 WITA
    expect(formatTanggalTerbit(d)).toBe('Selasa, 5 Maret 2024');
    expect(formatTanggalTerbit(d, false)).toBe('5 Maret 2024');
  });
});

describe('periksaIds / parseLampiran', () => {
  it('membuang id kosong & duplikat, undefined tetap undefined', () => {
    expect(periksaIds([' a', '', 'a', 'b'], 5, 'x')).toEqual({ ok: true, data: ['a', 'b'] });
    expect(periksaIds(undefined, 5, 'x')).toEqual({ ok: true, data: undefined });
  });

  it('galeri & dokumen ditolak bila melebihi batas, tepat di batas diterima', () => {
    const galeri = parseLampiran(body({ imageIds: ids(MAX_GALERI_PENGUMUMAN + 1) }));
    expect(galeri.ok).toBe(false);
    if (!galeri.ok) expect(galeri.message).toContain(`Maksimal ${MAX_GALERI_PENGUMUMAN} gambar galeri`);
    const dok = parseLampiran(body({ dokumenIds: ids(MAX_DOKUMEN_PENGUMUMAN + 1) }));
    expect(dok.ok).toBe(false);
    if (!dok.ok) expect(dok.message).toContain(`Maksimal ${MAX_DOKUMEN_PENGUMUMAN} dokumen`);
    expect(parseLampiran(body({ imageIds: ids(MAX_GALERI_PENGUMUMAN), dokumenIds: ids(MAX_DOKUMEN_PENGUMUMAN) })).ok).toBe(true);
  });

  it('imageId kosong → null (hapus gambar), tidak dikirim → undefined', () => {
    const kosong = parseLampiran(body({ imageId: ' ' }));
    expect(kosong.ok && kosong.data.imageId).toBeNull();
    const absen = parseLampiran(body());
    expect(absen.ok && absen.data).toEqual({
      imageId: undefined,
      imageIds: undefined,
      dokumenIds: undefined,
      tanggalTerbit: undefined,
    });
  });

  it('tanggal tidak valid menggagalkan parse', () => {
    expect(parseLampiran(body({ tanggalTerbit: '31-12-2024' })).ok).toBe(false);
  });
});

describe('periksaBerkas', () => {
  const rows = [
    { id: 'img', mimeType: 'image/webp' },
    { id: 'pdf', mimeType: 'application/pdf' },
    { id: 'gz', mimeType: 'application/gzip' },
  ];

  it('lolos bila gambar ber-mime image/* dan dokumen PDF', () => {
    expect(periksaBerkas({ gambar: ['img'], dokumen: ['pdf'] }, rows).ok).toBe(true);
  });

  it('menolak berkas yang tidak ada/nonaktif, gambar bukan gambar, dan dokumen bukan PDF', () => {
    const hilang = periksaBerkas({ gambar: ['x'], dokumen: [] }, rows);
    expect(!hilang.ok && hilang.message).toContain('tidak ditemukan');
    const bukanGambar = periksaBerkas({ gambar: ['pdf'], dokumen: [] }, rows);
    expect(!bukanGambar.ok && bukanGambar.message).toContain('bukan gambar');
    const bukanPdf = periksaBerkas({ gambar: [], dokumen: ['gz'] }, rows);
    expect(!bukanPdf.ok && bukanPdf.message).toContain('PDF');
  });

  it('rujukanBerkas menggabungkan gambar utama + galeri tanpa duplikat', () => {
    const r = parseLampiran(body({ imageId: 'a', imageIds: ['a', 'b'], dokumenIds: ['d'] }));
    expect(r.ok && rujukanBerkas(r.data)).toEqual({ gambar: ['a', 'b'], dokumen: ['d'] });
  });
});

describe('susunDataCreate / susunDataUpdate', () => {
  const parsed = (b: PengumumanBody) => {
    const r = parseLampiran(b);
    if (!r.ok) throw new Error(r.message);
    return r.data;
  };

  it('create: lampiran di-connect, tanggal dipakai bila ada', () => {
    const b = body({ imageId: 'img', imageIds: ['g1'], dokumenIds: ['d1', 'd2'], tanggalTerbit: '2024-03-05' });
    expect(susunDataCreate(b, parsed(b))).toEqual({
      judul: b.judul,
      deskripsi: b.deskripsi,
      content: b.content,
      categoryPengumumanId: 'kat-1',
      imageId: 'img',
      tanggalTerbit: new Date('2024-03-04T16:00:00.000Z'),
      images: { connect: [{ id: 'g1' }] },
      dokumen: { connect: [{ id: 'd1' }, { id: 'd2' }] },
    });
  });

  it('create tanpa lampiran: tidak ada connect & tanggalTerbit (default DB)', () => {
    const data = susunDataCreate(body(), parsed(body()));
    expect(data).not.toHaveProperty('images');
    expect(data).not.toHaveProperty('dokumen');
    expect(data).not.toHaveProperty('tanggalTerbit');
    expect(data.imageId).toBeNull();
  });

  it('update: field lampiran absen tidak disentuh; array kosong mengosongkan', () => {
    const absen = susunDataUpdate(body(), parsed(body()));
    expect(absen).not.toHaveProperty('imageId');
    expect(absen).not.toHaveProperty('images');
    expect(absen).not.toHaveProperty('dokumen');
    expect(absen).not.toHaveProperty('tanggalTerbit');

    const kosong = body({ imageId: null, imageIds: [], dokumenIds: [] });
    expect(susunDataUpdate(kosong, parsed(kosong))).toMatchObject({
      imageId: null,
      images: { set: [] },
      dokumen: { set: [] },
    });
  });

  it('kategori kosong disimpan null (perilaku lama update)', () => {
    const b = body({ categoryPengumumanId: '' });
    expect(susunDataUpdate(b, parsed(b)).categoryPengumumanId).toBeNull();
  });
});

describe('include & urutan', () => {
  it('list hanya membawa thumbnail, detail membawa galeri + dokumen', () => {
    expect(Object.keys(PENGUMUMAN_LIST_INCLUDE).sort()).toEqual(['CategoryPengumuman', 'image']);
    expect(Object.keys(PENGUMUMAN_DETAIL_INCLUDE).sort()).toEqual(['CategoryPengumuman', 'dokumen', 'image', 'images']);
  });

  it('urut tanggalTerbit terbaru lalu createdAt terbaru', () => {
    expect(PENGUMUMAN_LIST_ORDER_BY).toEqual([{ tanggalTerbit: 'desc' }, { createdAt: 'desc' }]);
  });
});
