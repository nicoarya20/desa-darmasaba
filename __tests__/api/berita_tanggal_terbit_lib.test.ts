// @vitest-environment node
// Logika murni tanggal terbit (modul bersama Berita & Pengumuman) dan data Prisma Berita:
// urutan list, create (tanggal kosong → default DB), update (tanggal/galeri tidak dikirim = tidak diubah).
import { describe, expect, it } from 'vitest';
import { BERITA_LIST_ORDER_BY, susunBeritaCreate, susunBeritaUpdate, type BeritaBody } from '@/lib/berita-data';
import * as pengumumanTanggal from '@/lib/pengumuman-tanggal';
import {
  formatTanggalTerbit,
  hariIniInput,
  parseTanggalTerbit,
  tanggalKeInput,
  tanggalTerbitAtauDibuat,
  tanggalTerbitJikaDiubah,
} from '@/lib/tanggal-terbit';

// test-only: body minimal dengan field lama
const body = (over: Partial<BeritaBody> = {}): BeritaBody => ({
  judul: 'Pelatihan UMKM',
  deskripsi: '<p>Ringkas</p>',
  content: '<p>Isi</p>',
  kategoriBeritaId: 'kat-1',
  imageId: 'img-1',
  imageIds: [],
  linkVideo: '',
  ...over,
});
const agustus = new Date('2026-08-17T00:00:00+08:00');

describe('tanggal-terbit (modul bersama)', () => {
  it('YYYY-MM-DD dibaca sebagai 00:00 WITA, ISO apa adanya, kosong → undefined', () => {
    expect(parseTanggalTerbit('2026-08-17')).toEqual({ ok: true, data: new Date('2026-08-16T16:00:00.000Z') });
    expect(parseTanggalTerbit('2026-07-01T10:30:00.000Z')).toEqual({ ok: true, data: new Date('2026-07-01T10:30:00.000Z') });
    expect(parseTanggalTerbit('  ')).toEqual({ ok: true, data: undefined });
    expect(parseTanggalTerbit(null)).toEqual({ ok: true, data: undefined });
  });

  it('tanggal mustahil / bukan string ditolak dengan pesan berkonteks', () => {
    expect(parseTanggalTerbit('2026-02-31')).toEqual({ ok: false, message: 'Tanggal terbit tidak valid: "2026-02-31"' });
    expect(parseTanggalTerbit('kemarin')).toEqual({ ok: false, message: 'Tanggal terbit tidak valid: "kemarin"' });
    expect(parseTanggalTerbit(20260817)).toEqual({ ok: false, message: 'Tanggal terbit tidak valid' });
  });

  it('tanggalKeInput & hariIniInput memakai kalender WITA (bukan UTC)', () => {
    // 16:30 UTC = 00:30 WITA hari berikutnya
    expect(tanggalKeInput('2026-08-16T16:30:00.000Z')).toBe('2026-08-17');
    expect(hariIniInput(new Date('2026-11-10T17:00:00.000Z'))).toBe('2026-11-11');
  });

  it('tanggalTerbitAtauDibuat: tanggalTerbit dipakai, fallback createdAt untuk respons lama', () => {
    expect(tanggalTerbitAtauDibuat({ tanggalTerbit: agustus, createdAt: '2026-11-11T02:00:00.000Z' })).toEqual(agustus);
    expect(tanggalTerbitAtauDibuat({ tanggalTerbit: null, createdAt: '2026-11-11T02:00:00.000Z' })).toEqual(
      new Date('2026-11-11T02:00:00.000Z'),
    );
    expect(tanggalTerbitAtauDibuat({ createdAt: '2026-11-11T02:00:00.000Z' })).toEqual(new Date('2026-11-11T02:00:00.000Z'));
  });

  it('tanggalTerbitJikaDiubah: kirim hanya bila berbeda dari nilai awal', () => {
    expect(tanggalTerbitJikaDiubah('2026-08-17', '2026-11-11')).toBe('2026-08-17');
    expect(tanggalTerbitJikaDiubah('2026-11-11', '2026-11-11')).toBe('');
  });

  it('formatTanggalTerbit: panjang, tanpa hari, dan bulan pendek — semuanya WITA', () => {
    // 2026-08-16T16:00Z = Senin 17 Agustus WITA
    expect(formatTanggalTerbit(agustus)).toBe('Senin, 17 Agustus 2026');
    expect(formatTanggalTerbit(agustus, false)).toBe('17 Agustus 2026');
    expect(formatTanggalTerbit(agustus, false, 'short')).toBe('17 Agu 2026');
  });

  it('pengumuman-tanggal tetap mengekspor nama lama dengan perilaku sama', () => {
    expect(pengumumanTanggal.parseTanggalTerbit).toBe(parseTanggalTerbit);
    expect(pengumumanTanggal.tanggalPengumuman).toBe(tanggalTerbitAtauDibuat);
    expect(pengumumanTanggal.formatTanggalTerbit(agustus)).toBe('Senin, 17 Agustus 2026');
  });
});

describe('berita-data', () => {
  it('urutan list: tanggalTerbit desc lalu createdAt desc', () => {
    expect(BERITA_LIST_ORDER_BY).toEqual([{ tanggalTerbit: 'desc' }, { createdAt: 'desc' }]);
  });

  it('create: tanggal disetel bila ada, kosong → tidak dikirim (default DB)', () => {
    expect(susunBeritaCreate(body({ imageIds: ['g1', 'g2'] }), agustus)).toEqual({
      content: '<p>Isi</p>',
      deskripsi: '<p>Ringkas</p>',
      imageId: 'img-1',
      judul: 'Pelatihan UMKM',
      kategoriBeritaId: 'kat-1',
      linkVideo: '',
      images: { connect: [{ id: 'g1' }, { id: 'g2' }] },
      tanggalTerbit: agustus,
    });
    const tanpaTanggal = susunBeritaCreate(body(), undefined);
    expect(tanpaTanggal).not.toHaveProperty('tanggalTerbit');
    expect(tanpaTanggal.images).toBeUndefined();
  });

  it('update: tanggal hanya diubah bila dikirim', () => {
    expect(susunBeritaUpdate(body(), agustus).tanggalTerbit).toEqual(agustus);
    expect(susunBeritaUpdate(body(), undefined)).not.toHaveProperty('tanggalTerbit');
  });

  it('update: kategori/gambar kosong → disconnect, galeri = set final, galeri tidak dikirim = tidak diubah', () => {
    const lengkap = susunBeritaUpdate(body({ imageIds: ['g1'] }), undefined);
    expect(lengkap.kategoriBerita).toEqual({ connect: { id: 'kat-1' } });
    expect(lengkap.image).toEqual({ connect: { id: 'img-1' } });
    expect(lengkap.images).toEqual({ set: [], connect: [{ id: 'g1' }] });

    const kosong = susunBeritaUpdate(body({ kategoriBeritaId: null, imageId: '', imageIds: [] }), undefined);
    expect(kosong.kategoriBerita).toEqual({ disconnect: true });
    expect(kosong.image).toEqual({ disconnect: true });
    expect(kosong.images).toEqual({ set: [] });

    expect(susunBeritaUpdate(body({ imageIds: undefined }), undefined)).not.toHaveProperty('images');
  });
});
