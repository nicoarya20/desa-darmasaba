// @vitest-environment node
// Logika tampilan item Sampah per fitur (lokasi bersama panel): badge sisa hari, info item, pratinjau, paging, teks.
import { describe, expect, it } from 'vitest';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { SAMPAH_RETENSI_HARI } from '@/lib/sampah/sampah-retensi';
import {
  halamanSetelahItemHilang,
  infoItemSampah,
  isGambarSampah,
  keteranganSampah,
  labelSisaHariSampah,
  teksKonfirmasiHapus,
  totalHalamanSampah,
  warnaSisaHari,
} from '@/app/admin/(dashboard)/_com/sampah/sampah-item.logic';

const item = (over: Partial<SampahItem> = {}): SampahItem => ({
  id: 'f1',
  judul: 'foto-kegiatan.jpg',
  mimeType: 'image/jpeg',
  kategori: 'image',
  ukuran: 3.4 * 1024 * 1024,
  pratinjauUrl: '/api/img/foto-kegiatan.webp',
  dihapusPada: '2026-11-09T03:00:00.000Z',
  sisaHari: 26,
  folderNama: null,
  ...over,
}); // test-only

describe('badge sisa hari', () => {
  it('peringatan (orange) bila ≤ 7 hari, selain itu abu-abu', () => {
    expect(warnaSisaHari(0)).toBe('orange');
    expect(warnaSisaHari(7)).toBe('orange');
    expect(warnaSisaHari(8)).toBe('gray');
    expect(warnaSisaHari(SAMPAH_RETENSI_HARI)).toBe('gray');
  });

  it('label sisa hari; 0 = terhapus hari ini', () => {
    expect(labelSisaHariSampah(12)).toBe('Sisa 12 hari');
    expect(labelSisaHariSampah(0)).toBe('Terhapus hari ini');
  });
});

describe('info item', () => {
  it('folder asal, ukuran terformat id-ID, tanggal hapus', () => {
    expect(infoItemSampah(item({ folderNama: 'Laporan' }))).toEqual({
      folder: 'Folder Laporan',
      ukuran: '3,4 MB',
      dihapus: 'Dihapus 9 Nov 2026',
    });
  });

  it('tanpa folder → null; ukuran tidak diketahui → "—"', () => {
    expect(infoItemSampah(item({ ukuran: null })).folder).toBeNull();
    expect(infoItemSampah(item({ ukuran: null })).ukuran).toBe('—');
    expect(infoItemSampah(item({ ukuran: 512 })).ukuran).toBe('512 B');
  });

  it('pratinjau gambar hanya untuk kategori image yang punya URL', () => {
    expect(isGambarSampah(item())).toBe(true);
    expect(isGambarSampah(item({ kategori: 'document' }))).toBe(false);
    expect(isGambarSampah(item({ pratinjauUrl: null }))).toBe(false);
  });
});

describe('paging', () => {
  it('jumlah halaman dibulatkan ke atas', () => {
    expect(totalHalamanSampah(0, 20)).toBe(0);
    expect(totalHalamanSampah(41, 20)).toBe(3);
  });

  it('item terakhir di halaman > 1 hilang → mundur satu halaman', () => {
    expect(halamanSetelahItemHilang(3, 1)).toBe(2);
    expect(halamanSetelahItemHilang(3, 5)).toBe(3);
    expect(halamanSetelahItemHilang(1, 1)).toBe(1);
  });
});

describe('teks', () => {
  it('keterangan menyebut retensi dari API', () => {
    expect(keteranganSampah(30)).toContain('30 hari');
  });

  it('konfirmasi hapus permanen tegas tidak bisa dibatalkan', () => {
    expect(teksKonfirmasiHapus('a.pdf')).toBe('"a.pdf" akan dihapus permanen beserta berkasnya. Tindakan ini tidak bisa dibatalkan.');
  });
});
