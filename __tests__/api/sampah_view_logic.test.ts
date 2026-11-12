// @vitest-environment node
// Logika tampilan Pengaturan → Sampah: label tab ber-jumlah, badge sisa hari, format ukuran/asal, paging, teks konfirmasi.
import { describe, expect, it } from 'vitest';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { SAMPAH_RETENSI_HARI } from '@/lib/sampah/sampah-retensi';
import {
  SAMPAH_KETERANGAN,
  halamanSetelahItemHilang,
  infoItemSampah,
  isGambarSampah,
  labelAsalSampah,
  labelSisaHariSampah,
  labelTabSampah,
  sampahTabs,
  teksKonfirmasiHapus,
  teksKonfirmasiKosongkan,
  teksSampahKosong,
  totalHalamanSampah,
  warnaSisaHari,
} from '@/app/admin/(dashboard)/pengaturan/sampah/_lib/sampah-view.logic';

const item = (over: Partial<SampahItem> = {}): SampahItem => ({
  id: 'file:f1',
  jenis: 'file',
  judul: 'foto-kegiatan.jpg',
  mimeType: 'image/jpeg',
  kategori: 'image',
  ukuran: 3.4 * 1024 * 1024,
  pratinjauUrl: '/api/pengaturan/sampah/file%3Af1/pratinjau',
  dihapusPada: '2026-11-09T03:00:00.000Z',
  sisaHari: 26,
  asal: { kelompokId: 'Desa', kelompokNama: 'Desa', menuId: 'desa.berita', menuNama: 'Berita' },
  ...over,
}); // test-only

describe('label & daftar tab', () => {
  it('label "Nama (n)" termasuk 0', () => {
    expect(labelTabSampah('Landing Page', 3)).toBe('Landing Page (3)');
    expect(labelTabSampah('PPID', 0)).toBe('PPID (0)');
  });

  it('tab Semua di depan, semua kelompok tampil; kelompok tanpa hitungan = 0', () => {
    const tabs = sampahTabs(
      [
        { id: 'PPID', nama: 'PPID' },
        { id: 'lainnya', nama: 'Lainnya' },
      ],
      { semua: 2, lainnya: 2 },
    );
    expect(tabs.map((t) => t.label)).toEqual(['Semua (2)', 'PPID (0)', 'Lainnya (2)']);
    expect(tabs[0].id).toBe('semua');
  });
});

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
  it('asal "Kelompok › Menu", ukuran terformat id-ID, tanggal hapus', () => {
    expect(infoItemSampah(item())).toEqual({ asal: 'Desa › Berita', ukuran: '3,4 MB', dihapus: 'Dihapus 9 Nov 2026' });
  });

  it('ukuran tidak diketahui → "—"; asal tanpa menu → nama kelompok saja', () => {
    const lainnya = item({ ukuran: null, asal: { kelompokId: 'lainnya', kelompokNama: 'Lainnya', menuId: null, menuNama: null } });
    expect(infoItemSampah(lainnya).ukuran).toBe('—');
    expect(labelAsalSampah(lainnya.asal)).toBe('Lainnya');
    expect(infoItemSampah(item({ ukuran: 512 })).ukuran).toBe('512 B');
  });

  it('pratinjau gambar hanya untuk kategori image yang punya URL', () => {
    expect(isGambarSampah(item())).toBe(true);
    expect(isGambarSampah(item({ kategori: 'document' }))).toBe(false);
    expect(isGambarSampah(item({ pratinjauUrl: null }))).toBe(false);
  });
});

describe('paging', () => {
  it('jumlah halaman dibulatkan ke atas dan dibatasi jendela API (page × limit ≤ 5000)', () => {
    expect(totalHalamanSampah(0, 20)).toBe(0);
    expect(totalHalamanSampah(41, 20)).toBe(3);
    expect(totalHalamanSampah(100000, 20)).toBe(250);
  });

  it('item terakhir di halaman > 1 hilang → mundur satu halaman', () => {
    expect(halamanSetelahItemHilang(3, 1)).toBe(2);
    expect(halamanSetelahItemHilang(3, 5)).toBe(3);
    expect(halamanSetelahItemHilang(1, 1)).toBe(1);
  });
});

describe('teks', () => {
  it('keterangan memakai konstanta retensi', () => {
    expect(SAMPAH_KETERANGAN).toContain(`${SAMPAH_RETENSI_HARI} hari`);
  });

  it('konfirmasi hapus permanen & kosongkan tegas tidak bisa dibatalkan, menyebut jumlah + kelompok', () => {
    expect(teksKonfirmasiHapus('a.pdf')).toContain('tidak bisa dibatalkan');
    expect(teksKonfirmasiKosongkan(4, { id: 'PPID', nama: 'PPID' })).toBe(
      '4 item di kelompok PPID akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
    );
    expect(teksKonfirmasiKosongkan(9, { id: 'semua', nama: 'Semua' })).toContain('9 item di seluruh Sampah');
  });

  it('empty state per tab, beda saat mencari', () => {
    expect(teksSampahKosong('PPID', '')).toBe('Sampah PPID kosong');
    expect(teksSampahKosong('PPID', 'sk')).toContain('"sk"');
  });
});
