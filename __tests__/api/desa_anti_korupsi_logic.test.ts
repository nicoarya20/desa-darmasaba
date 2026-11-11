// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  groupByKategori,
  splitIndicatorNumber,
  toSentenceCase,
  type AntiKorupsiApiItem,
} from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';

// test-only: bentuk meniru item desaAntikorupsi.findMany (nama tersimpan kapital seperti data desa).
const item = (id: string, name: string, kategoriId: string, kategori: string): AntiKorupsiApiItem => ({
  id,
  name,
  kategoriId,
  kategori: { name: kategori },
});

describe('toSentenceCase', () => {
  it('mengubah teks kapital menjadi huruf biasa dengan huruf pertama kapital', () => {
    expect(toSentenceCase('PENGUATAN TATA LAKSANA')).toBe('Penguatan tata laksana');
    expect(toSentenceCase('ADANYA MAKLUMAT PELAYANAN')).toBe('Adanya maklumat pelayanan');
  });

  it('mempertahankan ejaan singkatan yang dikenal, termasuk yang dipisah garis miring', () => {
    expect(toSentenceCase('ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG APBDES')).toBe(
      'Adanya Perdes/keputusan kepala desa/SOP tentang APBDes',
    );
    expect(toSentenceCase('SOP PENGADUAN')).toBe('SOP pengaduan');
    expect(toSentenceCase('SURVEY KEPUASAN MASYARAKAT (SKM) DALAM PENYUSUNAN RKP DESA')).toBe(
      'Survey kepuasan masyarakat (SKM) dalam penyusunan RKP desa',
    );
  });

  it('tidak memperlakukan potongan kata sebagai singkatan', () => {
    expect(toSentenceCase('PENYUSUNAN SOPIR')).toBe('Penyusunan sopir');
  });

  it('membiarkan teks yang sudah memuat huruf kecil, hanya merapikan spasi', () => {
    expect(toSentenceCase('  Adanya layanan   pengaduan SMS ')).toBe('Adanya layanan pengaduan SMS');
  });

  it('menangani teks yang diawali angka atau tanda baca', () => {
    expect(toSentenceCase('3(TIGA) TAHUN TERAKHIR')).toBe('3(tiga) tahun terakhir');
    expect(toSentenceCase('"KEARIFAN" LOKAL')).toBe('"Kearifan" lokal');
    expect(toSentenceCase('')).toBe('');
  });

  it('menerima daftar istilah sendiri', () => {
    expect(toSentenceCase('LAPORAN BPD', { bpd: 'BPD' })).toBe('Laporan BPD');
  });
});

describe('splitIndicatorNumber', () => {
  it('memisahkan nomor indikator dari teks', () => {
    expect(splitIndicatorNumber('1.1 ADANYA PERDES')).toEqual({ number: '1.1', text: 'ADANYA PERDES' });
    expect(splitIndicatorNumber('  5.2   ADANYA TOKOH ')).toEqual({ number: '5.2', text: 'ADANYA TOKOH' });
  });

  it('menerima nomor bertingkat dan tanda titik/kurung penutup', () => {
    expect(splitIndicatorNumber('1.2.3 TEKS')).toEqual({ number: '1.2.3', text: 'TEKS' });
    expect(splitIndicatorNumber('2. TEKS')).toEqual({ number: '2', text: 'TEKS' });
    expect(splitIndicatorNumber('3) TEKS')).toEqual({ number: '3', text: 'TEKS' });
  });

  it('mengembalikan number null bila teks tidak diawali nomor', () => {
    expect(splitIndicatorNumber('ADANYA MAKLUMAT')).toEqual({ number: null, text: 'ADANYA MAKLUMAT' });
    expect(splitIndicatorNumber('3(TIGA) TAHUN')).toEqual({ number: null, text: '3(TIGA) TAHUN' });
    expect(splitIndicatorNumber('1.1')).toEqual({ number: null, text: '1.1' });
  });
});

describe('groupByKategori', () => {
  it('menampilkan nama kategori sekali per grup dengan butir bernomor, urutan data dipertahankan', () => {
    const groups = groupByKategori([
      item('a', '1.1 ADANYA PERDES/SOP TENTANG APBDES', 'k1', 'PENGUATAN TATA LAKSANA'),
      item('b', '1.2 ADANYA EVALUASI KINERJA', 'k1', 'PENGUATAN TATA LAKSANA'),
      item('c', '2.1 ADANYA KEGIATAN PENGAWASAN', 'k2', 'PENGUATAN PENGAWASAN'),
    ]);

    expect(groups).toEqual([
      {
        id: 'k1',
        name: 'Penguatan tata laksana',
        items: [
          { id: 'a', number: '1.1', text: 'Adanya Perdes/SOP tentang APBDes' },
          { id: 'b', number: '1.2', text: 'Adanya evaluasi kinerja' },
        ],
      },
      {
        id: 'k2',
        name: 'Penguatan pengawasan',
        items: [{ id: 'c', number: '2.1', text: 'Adanya kegiatan pengawasan' }],
      },
    ]);
  });

  it('menyatukan butir sekategori walau tidak berurutan, urutan grup = kemunculan pertama', () => {
    const groups = groupByKategori([
      item('a', '2.1 A', 'k2', 'KEDUA'),
      item('b', '1.1 B', 'k1', 'PERTAMA'),
      item('c', '2.2 C', 'k2', 'KEDUA'),
    ]);

    expect(groups.map((g) => [g.id, g.items.map((i) => i.id)])).toEqual([
      ['k2', ['a', 'c']],
      ['k1', ['b']],
    ]);
  });

  it('butir tanpa nomor tetap tampil dengan number null', () => {
    expect(groupByKategori([item('a', 'ADANYA MAKLUMAT', 'k1', 'LAYANAN')])[0].items).toEqual([
      { id: 'a', number: null, text: 'Adanya maklumat' },
    ]);
  });

  it('mengembalikan array kosong untuk data kosong', () => {
    expect(groupByKategori([])).toEqual([]);
  });
});
