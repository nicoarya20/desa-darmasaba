// @vitest-environment node
// Panel Sampah per fitur: fungsi tampilan murni (badge sisa hari, info item, teks, pagination) + URL API.
import { describe, expect, it } from 'vitest';
import { sampahPanelListUrl } from '@/app/admin/(dashboard)/_com/sampah/sampah-panel.api';
import {
  SAMPAH_PANEL_SISA_PERINGATAN,
  halamanSetelahItemHilangPanel,
  infoItemSampahPanel,
  isGambarSampahPanel,
  judulSampahPanel,
  labelSisaHariPanel,
  teksKonfirmasiHapusPermanenPanel,
  teksKonfirmasiPindahKeSampah,
  teksSampahPanelKosong,
  totalHalamanSampahPanel,
  warnaSisaHariPanel,
} from '@/app/admin/(dashboard)/_com/sampah/sampah-panel.logic';
import { SAMPAH_RETENSI_HARI } from '@/lib/sampah/sampah-retensi';

describe('badge sisa hari', () => {
  it('oranye bila sisa ≤ 7 hari, abu-abu bila lebih', () => {
    expect(SAMPAH_PANEL_SISA_PERINGATAN).toBe(7);
    expect(warnaSisaHariPanel(0)).toBe('orange');
    expect(warnaSisaHariPanel(7)).toBe('orange');
    expect(warnaSisaHariPanel(8)).toBe('gray');
    expect(warnaSisaHariPanel(30)).toBe('gray');
  });

  it('label "Sisa N hari", atau "Terhapus hari ini" bila habis', () => {
    expect(labelSisaHariPanel(12)).toBe('Sisa 12 hari');
    expect(labelSisaHariPanel(1)).toBe('Sisa 1 hari');
    expect(labelSisaHariPanel(0)).toBe('Terhapus hari ini');
  });
});

describe('infoItemSampahPanel', () => {
  it('menggabungkan folder asal, ukuran terformat, dan tanggal dihapus', () => {
    const info = infoItemSampahPanel({ folderNama: 'Semester I', ukuran: 2048, dihapusPada: '2026-11-10T03:00:00.000Z' });
    expect(info).toBe('Folder Semester I · 2 KB · Dihapus 10 Nov 2026');
  });

  it('melewati folder & ukuran yang tidak ada', () => {
    expect(infoItemSampahPanel({ folderNama: null, ukuran: null, dihapusPada: '2026-11-10T03:00:00.000Z' })).toBe(
      'Dihapus 10 Nov 2026',
    );
  });
});

describe('teks panel', () => {
  it('judul bagian lipat menyebut jumlah setelah dimuat', () => {
    expect(judulSampahPanel(null)).toBe('Sampah');
    expect(judulSampahPanel(0)).toBe('Sampah (0)');
    expect(judulSampahPanel(4)).toBe('Sampah (4)');
  });

  it('empty state menyebut lama retensi', () => {
    expect(teksSampahPanelKosong(30)).toBe('Sampah kosong. Item yang dihapus disimpan di sini selama 30 hari.');
  });

  it('konfirmasi hapus permanen menyebut judul & tidak bisa dibatalkan', () => {
    expect(teksKonfirmasiHapusPermanenPanel('Perdes APBDes')).toContain('"Perdes APBDes"');
    expect(teksKonfirmasiHapusPermanenPanel('x')).toContain('tidak bisa dibatalkan');
  });

  it('konfirmasi hapus di fitur memakai angka retensi konstanta', () => {
    expect(teksKonfirmasiPindahKeSampah('Foto')).toBe(
      `Foto dipindah ke Sampah dan bisa dipulihkan dalam ${SAMPAH_RETENSI_HARI} hari.`,
    );
    expect(teksKonfirmasiPindahKeSampah('Dokumen')).toContain('Dokumen dipindah ke Sampah');
  });
});

describe('thumbnail & pagination', () => {
  it('gambar hanya bila kategori image dan ada pratinjauUrl', () => {
    expect(isGambarSampahPanel({ kategori: 'image', pratinjauUrl: '/f/1' })).toBe(true);
    expect(isGambarSampahPanel({ kategori: 'image', pratinjauUrl: null })).toBe(false);
    expect(isGambarSampahPanel({ kategori: 'document', pratinjauUrl: '/f/1' })).toBe(false);
  });

  it('jumlah halaman minimal 1, dibulatkan ke atas', () => {
    expect(totalHalamanSampahPanel(0, 20)).toBe(1);
    expect(totalHalamanSampahPanel(20, 20)).toBe(1);
    expect(totalHalamanSampahPanel(21, 20)).toBe(2);
  });

  it('mundur satu halaman bila item terakhir di halaman > 1 hilang', () => {
    expect(halamanSetelahItemHilangPanel(3, 1)).toBe(2);
    expect(halamanSetelahItemHilangPanel(3, 5)).toBe(3);
    expect(halamanSetelahItemHilangPanel(1, 1)).toBe(1);
  });
});

describe('sampahPanelListUrl', () => {
  it('dokumen APBDes mengirim scopeId + page + limit', () => {
    expect(sampahPanelListUrl('dokumen-apbdes', { scopeId: 'ap 1', page: 2, limit: 20 })).toBe(
      '/api/sampah/dokumen-apbdes?scopeId=ap+1&page=2&limit=20',
    );
  });

  it('sumber tanpa cakupan tidak mengirim scopeId', () => {
    expect(sampahPanelListUrl('foto-bumdes', { page: 1, limit: 20 })).toBe('/api/sampah/foto-bumdes?page=1&limit=20');
  });
});
