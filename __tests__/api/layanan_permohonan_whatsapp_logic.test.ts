// @vitest-environment node
// URL WhatsApp tindak lanjut permohonan surat keterangan: nomor petugas, encoding, dan privasi (tanpa NIK/KK/alamat).
import {
  buildPermohonanWaMessage,
  buildPermohonanWaUrl,
  hasPetugasWa,
  teleponKantor,
} from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/permohonan-whatsapp.logic';
import { describe, expect, it } from 'vitest';

// test-only: nomor fiktif; di produksi nomor petugas hanya berasal dari KontakDesa.whatsapp (CMS).
const WA_PETUGAS = '+62 812-0000-0001';
const WA_PETUGAS_NORMAL = '6281200000001';
const TELEPON_KANTOR = '(0361) 555 0100';

// searchParams.get sudah men-decode; decodeURIComponent kedua akan merusak teks yang memuat "%".
const decodeText = (url: string) => new URL(url).searchParams.get('text') ?? '';

describe('buildPermohonanWaUrl', () => {
  it('menuju nomor dari Kontak Desa yang dinormalisasi dengan pesan ter-encode', () => {
    const url = buildPermohonanWaUrl({ nama: 'Made Wirawan', kategoriNama: 'Surat Keterangan Kelakuan Baik' }, WA_PETUGAS);
    expect(url).toBe(
      `https://wa.me/${WA_PETUGAS_NORMAL}?text=` +
        encodeURIComponent('Halo, saya Made Wirawan ingin mengajukan Surat Keterangan Kelakuan Baik melalui website Desa Darmasaba.'),
    );
    expect(url).not.toMatch(/\s/);
  });

  it('format nomor berbeda (0812…, 62812…) menghasilkan tautan yang sama', () => {
    const input = { nama: 'Made', kategoriNama: 'Surat Domisili' };
    const baku = buildPermohonanWaUrl(input, WA_PETUGAS);
    expect(buildPermohonanWaUrl(input, '0812 0000 0001')).toBe(baku);
    expect(buildPermohonanWaUrl(input, '6281200000001')).toBe(baku);
  });

  it.each([null, undefined, '', '   '])('nomor kosong (%j) → null (UI memakai fallback, bukan tautan rusak)', (kosong) => {
    expect(buildPermohonanWaUrl({ nama: 'Made', kategoriNama: 'Surat' }, kosong)).toBeNull();
  });

  it.each(['(0361) 555 0100', '112', 'bukan nomor', '+1 202 555 0100'])(
    'nomor bukan seluler Indonesia (%s) → null',
    (tidakValid) => {
      expect(buildPermohonanWaUrl({ nama: 'Made', kategoriNama: 'Surat' }, tidakValid)).toBeNull();
    },
  );

  it('NIK, nomor KK, dan alamat yang ikut di input tidak masuk ke URL maupun pesan', () => {
    const input = {
      nama: 'Ni Luh Sari',
      kategoriNama: 'Surat Keterangan Domisili',
      nik: '5103010101010001',
      nomorKk: '5103010101010002',
      alamat: 'Jl. Raya Darmasaba No. 9',
    };
    const url = buildPermohonanWaUrl(input, WA_PETUGAS) as string;
    const text = decodeText(url);
    for (const rahasia of [input.nik, input.nomorKk, input.alamat, 'Raya Darmasaba']) {
      expect(url).not.toContain(rahasia);
      expect(text).not.toContain(rahasia);
    }
    expect(text).toContain('Ni Luh Sari');
  });

  it('karakter khusus pada nama & kategori di-encode dan kembali utuh saat di-decode', () => {
    const nama = "I Wayan O'Brien & Putra #1 100%?";
    const kategori = 'Surat Keterangan Usaha (SKU) / Izin';
    const url = buildPermohonanWaUrl({ nama, kategoriNama: kategori }, WA_PETUGAS) as string;
    // Hanya satu parameter query: '&', '#', '?' dari input tidak boleh membelah URL.
    expect(new URL(url).searchParams.getAll('text')).toHaveLength(1);
    expect(new URL(url).hash).toBe('');
    expect(decodeText(url)).toBe(buildPermohonanWaMessage({ nama, kategoriNama: kategori }));
    expect(decodeText(url)).toContain(nama);
    expect(decodeText(url)).toContain(kategori);
  });

  it('spasi/baris baru beruntun dirapikan dan bagian terlalu panjang dipotong', () => {
    expect(buildPermohonanWaMessage({ nama: '  Made \n\t Wirawan  ', kategoriNama: 'Surat\nDomisili' })).toBe(
      'Halo, saya Made Wirawan ingin mengajukan Surat Domisili melalui website Desa Darmasaba.',
    );
    const panjang = buildPermohonanWaMessage({ nama: 'A'.repeat(5000), kategoriNama: 'B'.repeat(5000) });
    expect(panjang.length).toBeLessThan(300);
  });

  it('kategori kosong memakai "surat keterangan" agar kalimat tetap utuh', () => {
    expect(buildPermohonanWaMessage({ nama: 'Made', kategoriNama: undefined })).toBe(
      'Halo, saya Made ingin mengajukan surat keterangan melalui website Desa Darmasaba.',
    );
  });
});

describe('hasPetugasWa', () => {
  it('true hanya untuk nomor seluler valid', () => {
    expect(hasPetugasWa(WA_PETUGAS)).toBe(true);
    for (const salah of [null, undefined, '', TELEPON_KANTOR, 'abc']) expect(hasPetugasWa(salah)).toBe(false);
  });
});

describe('teleponKantor', () => {
  it('telepon tetap & seluler → teks tampil + tel:; kosong/layanan pendek/bukan nomor → null', () => {
    expect(teleponKantor(TELEPON_KANTOR)).toMatchObject({ display: '(0361) 555 0100', telHref: 'tel:+623615550100' });
    expect(teleponKantor(WA_PETUGAS)?.telHref).toBe('tel:+6281200000001');
    for (const salah of [null, undefined, '', '112', 'abc']) expect(teleponKantor(salah)).toBeNull();
  });
});
