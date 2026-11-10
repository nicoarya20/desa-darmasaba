// @vitest-environment node
// Halaman detail Desa Anti Korupsi: tiap indikator yang sudah berisi dokumen membuka halaman programnya
// (folder & dokumen), atau tampil sebagai tempat kosong "Dokumen belum tersedia" sampai admin mengunggah dokumen.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (interaksi klik diverifikasi manual).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AntiKorupsiDokumenList } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/AntiKorupsiDokumenList';
import { AntiKorupsiKategoriPills } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/AntiKorupsiKategoriPills';
import {
  countByKategori,
  countDokumen,
  kategoriNames,
  toDokumenRows,
  toIsi,
  type AntiKorupsiDetailApiItem,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/antikorupsi-detail.logic';
import { AK_DETAIL_TEXT } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/antikorupsi-detail.text';

// test-only: item berbentuk respons desaAntikorupsi.findMany (data desa tersimpan kapital + bernomor).
const items: AntiKorupsiDetailApiItem[] = [
  {
    id: 'a',
    name: '1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG APBDES',
    kategori: { name: 'PENGUATAN TATA LAKSANA' },
    jumlahFolder: 2,
    jumlahDokumen: 5,
  },
  { id: 'b', name: '1.2 ADANYA SOP EVALUASI KINERJA', kategori: { name: 'PENGUATAN TATA LAKSANA' }, jumlahFolder: 1, jumlahDokumen: 0 },
  { id: 'c', name: '5.1 ADANYA BUDAYA LOKAL', kategori: { name: 'KEARIFAN LOKAL' } },
  { id: 'd', name: 'TANPA KATEGORI', kategori: null, jumlahFolder: 0, jumlahDokumen: 3 },
];

describe('toIsi', () => {
  it('ada dokumen → tautan halaman program + ringkasan "N folder · M dokumen" (folder 0 disembunyikan)', () => {
    expect(toIsi(items[0])).toEqual({ href: '/darmasaba/desa-anti-korupsi/program/a', ringkasan: '2 folder · 5 dokumen' });
    expect(toIsi(items[3])).toEqual({ href: '/darmasaba/desa-anti-korupsi/program/d', ringkasan: '3 dokumen' });
  });

  it('tanpa dokumen (0 atau field kosong) → null walau sudah ada folder', () => {
    expect(toIsi(items[1])).toBeNull();
    expect(toIsi(items[2])).toBeNull();
  });
});

describe('toDokumenRows', () => {
  const rows = toDokumenRows(items);

  it('nomor dipisah, teks sentence case dengan singkatan dipertahankan', () => {
    expect(rows[0]).toMatchObject({
      id: 'a',
      number: '1.1',
      text: 'Adanya Perdes/keputusan kepala desa/SOP tentang APBDes',
    });
    expect(rows[3]).toMatchObject({ number: null, text: 'Tanpa kategori' });
  });

  it('isi hanya ada bila indikator punya dokumen; countDokumen menghitung indikator berisi', () => {
    expect(rows[0].isi?.ringkasan).toBe('2 folder · 5 dokumen');
    expect(rows[1].isi).toBeNull();
    expect(rows[2].isi).toBeNull();
    expect(countDokumen(rows)).toBe(2);
  });
});

describe('kategori', () => {
  it('nama kategori unik sesuai urutan data, item tanpa kategori diabaikan', () => {
    expect(kategoriNames(items)).toEqual(['PENGUATAN TATA LAKSANA', 'KEARIFAN LOKAL']);
    expect(countByKategori(items)).toEqual({ 'PENGUATAN TATA LAKSANA': 2, 'KEARIFAN LOKAL': 1 });
  });

  it('pil: label sentence case + jumlah, hanya kategori terpilih yang aria-pressed', () => {
    const html = renderToStaticMarkup(
      <AntiKorupsiKategoriPills
        categories={kategoriNames(items)}
        counts={countByKategori(items)}
        selected="KEARIFAN LOKAL"
        onSelect={() => {}}
      />,
    );
    expect(html).toContain(`aria-label="${AK_DETAIL_TEXT.filterLabel}"`);
    expect(html).toContain('Penguatan tata laksana');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Kearifan lokal<span[^>]*>1<\/span>/);
  });
});

describe('AntiKorupsiDokumenList', () => {
  const html = renderToStaticMarkup(<AntiKorupsiDokumenList rows={toDokumenRows(items.slice(0, 2))} labelledBy="judul" />);

  it('indikator berisi = tautan ke halaman program (tab yang sama) dengan ringkasan & label aksesibel', () => {
    expect(html).toContain('href="/darmasaba/desa-anti-korupsi/program/a"');
    expect(html).not.toContain('target="_blank"');
    expect(html).toContain('2 folder · 5 dokumen');
    expect(html).toContain('aria-label="Buka dokumen 1.1 Adanya Perdes/keputusan kepala desa/SOP tentang APBDes (2 folder · 5 dokumen)"');
  });

  it('indikator tanpa dokumen tetap tampil sebagai tempat kosong, bukan tautan', () => {
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('Adanya SOP evaluasi kinerja');
    expect(html).toContain(AK_DETAIL_TEXT.pending);
    expect(html).toContain('aria-labelledby="judul"');
  });
});
