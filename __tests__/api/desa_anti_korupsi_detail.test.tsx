// @vitest-environment node
// Halaman detail Desa Anti Korupsi: tiap indikator membuka surat (PDF) di tab baru, atau tampil sebagai
// tempat kosong "Dokumen belum tersedia" sampai admin mengunggah file-nya.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (interaksi klik diverifikasi manual).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AntiKorupsiDokumenList } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/AntiKorupsiDokumenList';
import { AntiKorupsiKategoriPills } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/AntiKorupsiKategoriPills';
import {
  countByKategori,
  countDokumen,
  documentHref,
  documentType,
  kategoriNames,
  toDokumen,
  toDokumenRows,
  type AntiKorupsiDetailApiItem,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/antikorupsi-detail.logic';
import { AK_DETAIL_TEXT } from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_com/antikorupsi-detail.text';

// test-only: item berbentuk respons desaAntikorupsi.findMany (data desa tersimpan kapital + bernomor).
const pdf = {
  link: '/api/fileStorage/findUnique/perdes-apbdes.pdf',
  mimeType: 'application/pdf',
  realName: 'Perdes APBDes.pdf',
  name: 'perdes-apbdes.pdf',
};
const items: AntiKorupsiDetailApiItem[] = [
  {
    id: 'a',
    name: '1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG APBDES',
    kategori: { name: 'PENGUATAN TATA LAKSANA' },
    file: pdf,
  },
  { id: 'b', name: '1.2 ADANYA SOP EVALUASI KINERJA', kategori: { name: 'PENGUATAN TATA LAKSANA' }, file: null },
  { id: 'c', name: '5.1 ADANYA BUDAYA LOKAL', kategori: { name: 'KEARIFAN LOKAL' } },
  { id: 'd', name: 'TANPA KATEGORI', kategori: null },
];

describe('documentHref', () => {
  it('menerima link relatif fileStorage dan http(s)', () => {
    expect(documentHref(' /api/fileStorage/findUnique/a.pdf ')).toBe('/api/fileStorage/findUnique/a.pdf');
    expect(documentHref('https://drive.example.test/a.pdf')).toBe('https://drive.example.test/a.pdf');
  });

  it('menolak link kosong, protocol-relative, dan skema berbahaya', () => {
    expect(documentHref(null)).toBeNull();
    expect(documentHref('   ')).toBeNull();
    expect(documentHref('//evil.test/a.pdf')).toBeNull();
    expect(documentHref('javascript:alert(1)')).toBeNull();
  });
});

describe('documentType', () => {
  it('PDF dari mimeType, selain itu ekstensi nama file, fallback "dokumen"', () => {
    expect(documentType({ mimeType: 'application/pdf', realName: 'x' })).toBe('PDF');
    expect(documentType({ mimeType: 'application/msword', realName: 'surat.docx' })).toBe('DOCX');
    expect(documentType({ name: 'tanpa-ekstensi' })).toBe('dokumen');
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

  it('dokumen hanya ada bila file punya link aman; tanpa file → null (tempat kosong)', () => {
    expect(rows[0].dokumen).toEqual({ href: pdf.link, type: 'PDF' });
    expect(rows[1].dokumen).toBeNull();
    expect(rows[2].dokumen).toBeNull();
    expect(toDokumen({ ...pdf, link: 'javascript:alert(1)' })).toBeNull();
    expect(countDokumen(rows)).toBe(1);
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

  it('indikator bersurat = tautan ke file di tab baru dengan label aksesibel', () => {
    expect(html).toContain(`href="${pdf.link}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Buka PDF 1.1 Adanya Perdes/keputusan kepala desa/SOP tentang APBDes (tab baru)"');
    expect(html).toContain(AK_DETAIL_TEXT.open('PDF'));
  });

  it('indikator tanpa surat tetap tampil sebagai tempat kosong, bukan tautan', () => {
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('Adanya SOP evaluasi kinerja');
    expect(html).toContain(AK_DETAIL_TEXT.pending);
    expect(html).toContain('aria-labelledby="judul"');
  });
});
