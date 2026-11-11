// @vitest-environment node
// Halaman Potensi Desa: kartu (judul kiri bawah + deskripsi) dan overlay detail (bukan pindah halaman).
// Catatan: environment jsdom gagal start di repo ini (require ESM ber-top-level-await di cssstyle), jadi
// markup diuji via renderToStaticMarkup; DOMPurify (butuh DOM) diganti stub yang mencatat opsi.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, ModalRoot } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sanitize = vi.hoisted(() => vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')));
vi.mock('dompurify', () => ({ default: { sanitize } }));

import { PotensiCard } from '@/app/(public)/(pages)/pemerintahan/potensi/_com/PotensiCard';
import { PotensiHeader } from '@/app/(public)/(pages)/pemerintahan/potensi/_com/PotensiHeader';
import { PotensiDetailModal } from '@/app/(public)/(pages)/pemerintahan/potensi/_com/PotensiDetailModal';
import {
  POTENSI_LIST_LIMIT,
  RICH_TEXT_TAGS,
  countByFilter,
  dokumentasiImages,
  filterPotensi,
  isWisata,
  htmlToPlainText,
  potensiInfoRows,
  sanitizePotensiHtml,
  type PotensiItem,
} from '@/app/(public)/(pages)/pemerintahan/potensi/_com/potensi.logic';
import { POTENSI_TEXT } from '@/app/(public)/(pages)/pemerintahan/potensi/_com/potensi.text';

// test-only: item fiktif berbentuk respons potensiDesa.findMany.
const item: PotensiItem = {
  id: 'p1',
  name: 'Taman Beji Cengana',
  deskripsi: '<p>Situs keagamaan <strong>tradisional</strong> Bali &amp; budaya.</p>',
  content: '<p>Taman Beji memadukan unsur spiritual.</p><script>alert(1)</script>',
  kategori: { nama: 'Wisata' },
  image: { link: 'https://example.test/beji.jpg' },
};

// Modal di portal tidak dirender di server; matikan portal agar isi overlay bisa diperiksa.
const theme = { components: { ModalRoot: ModalRoot.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '');

beforeEach(() => {
  sanitize.mockClear();
});

describe('htmlToPlainText', () => {
  it('buang tag, pisahkan paragraf, decode entitas', () => {
    expect(htmlToPlainText('<p>Satu <strong>dua</strong></p><p>tiga&nbsp;&amp; &#8211; &lt;b&gt;</p>')).toBe('Satu dua tiga & – <b>');
  });

  it('kosong / null → string kosong', () => {
    expect(htmlToPlainText('<p></p>')).toBe('');
    expect(htmlToPlainText(null)).toBe('');
  });
});

describe('sanitizePotensiHtml', () => {
  it('memakai DOMPurify dengan tag format dasar saja, tanpa atribut', () => {
    expect(sanitizePotensiHtml('<p>a</p><script>x</script>')).toBe('<p>a</p>');
    expect(sanitize).toHaveBeenCalledWith('<p>a</p><script>x</script>', { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: [] });
  });

  it('isian kosong dari editor dianggap tidak ada isi', () => {
    expect(sanitizePotensiHtml('<p>&nbsp; </p>')).toBe('');
    expect(sanitizePotensiHtml(undefined)).toBe('');
    expect(sanitize).not.toHaveBeenCalled();
  });
});

describe('potensiInfoRows & dokumentasiImages', () => {
  it('urutan Lokasi, Pengelola, Status; kosong/spasi → null', () => {
    expect(potensiInfoRows({ ...item, lokasi: ' Subak Darmasaba ', pengelola: '  ', status: undefined })).toEqual([
      { key: 'lokasi', value: 'Subak Darmasaba' },
      { key: 'pengelola', value: null },
      { key: 'status', value: null },
    ]);
  });

  it('hanya foto bertautan; kunci dari id atau indeks', () => {
    expect(dokumentasiImages({ ...item, dokumentasi: [{ id: 'a', link: 'u1' }, { link: null }, { link: 'u3' }] })).toEqual([
      { key: 'a', link: 'u1' },
      { key: '2', link: 'u3' },
    ]);
    expect(dokumentasiImages(item)).toEqual([]);
  });

  it('batas muat daftar cukup untuk semua potensi desa (bukan default 10)', () => {
    expect(POTENSI_LIST_LIMIT).toBeGreaterThan(10);
  });
});

describe('saring Semua / Potensi / Wisata', () => {
  // test-only: 3 item, satu wisata dengan nama kategori berhuruf campur, satu tanpa kategori.
  const list: PotensiItem[] = [
    { ...item, id: 'w', kategori: { nama: ' WISATA ' } },
    { ...item, id: 'e', kategori: { nama: 'Ekonomi' } },
    { ...item, id: 'n', kategori: null },
  ];

  it('wisata dikenali tanpa peduli huruf/spasi; tanpa kategori = potensi', () => {
    expect(list.map(isWisata)).toEqual([true, false, false]);
  });

  it('jumlah per pilihan & isi grid tiap pilihan', () => {
    expect(countByFilter(list)).toEqual({ semua: 3, potensi: 2, wisata: 1 });
    expect(filterPotensi(list, 'semua').map((i) => i.id)).toEqual(['w', 'e', 'n']);
    expect(filterPotensi(list, 'potensi').map((i) => i.id)).toEqual(['e', 'n']);
    expect(filterPotensi(list, 'wisata').map((i) => i.id)).toEqual(['w']);
    expect(countByFilter([])).toEqual({ semua: 0, potensi: 0, wisata: 0 });
  });
});

describe('PotensiHeader', () => {
  it('judul h1, pengantar, 3 tombol pil berjumlah; pilihan aktif aria-pressed', () => {
    const html = render(<PotensiHeader filter="wisata" counts={{ semua: 11, potensi: 6, wisata: 5 }} onFilter={() => {}} />);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${POTENSI_TEXT.title}</h1>`));
    expect(html).toContain(POTENSI_TEXT.lead);
    expect(html).toContain(`role="group" aria-label="${POTENSI_TEXT.filterLabel}"`);
    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Wisata<span[^>]*>5<\/span>/);
    expect(html).toMatch(/>Semua<span[^>]*>11<\/span>/);
    expect(html).toMatch(/>Potensi<span[^>]*>6<\/span>/);
  });

  it('saat memuat: tombol nonaktif tanpa angka', () => {
    const html = render(<PotensiHeader filter="semua" counts={null} onFilter={() => {}} />);
    expect(html.match(/disabled=""/g)).toHaveLength(3);
    expect(html).not.toMatch(/<span/);
  });
});

describe('PotensiCard', () => {
  const html = render(<PotensiCard item={item} onOpen={() => {}} />);

  it('judul selalu tampil (h2 di atas foto, tanpa hover), kategori, dan deskripsi singkat teks polos', () => {
    expect(html).toMatch(/<h2[^>]*>Taman Beji Cengana<\/h2>/);
    expect(html).toContain('>Wisata<');
    expect(html).toMatch(/<p[^>]*>Situs keagamaan tradisional Bali &amp; budaya\.<\/p>/);
    expect(html).not.toContain('opacity');
  });

  it('"Lihat Detail" berupa tombol pembuka dialog, bukan tautan ke halaman detail', () => {
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain(POTENSI_TEXT.detail);
    expect(html).toContain(`aria-label="${POTENSI_TEXT.detailLabel(item.name)}"`);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toMatch(/<a[\s>]/);
    expect(html).not.toContain('/desa/potensi/p1');
  });

  it('tanpa deskripsi → tidak ada paragraf kosong', () => {
    const empty = render(<PotensiCard item={{ ...item, deskripsi: '<p></p>' }} onOpen={() => {}} />);
    expect(empty).not.toMatch(/<p[^>]*><\/p>/);
  });
});

describe('PotensiDetailModal', () => {
  it('dialog: hero (kategori + judul), tombol tutup, deskripsi tanpa label, tersanitasi, latar blur', () => {
    const html = render(<PotensiDetailModal item={item} opened onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toMatch(/<h2[^>]*>Taman Beji Cengana<\/h2>/);
    expect(html).toContain('>Wisata<');
    expect(html).toContain(`aria-label="${POTENSI_TEXT.close}"`);
    expect(html).not.toContain('Deskripsi Lengkap');
    expect(html).toContain('<p>Taman Beji memadukan unsur spiritual.</p>');
    expect(html).not.toContain('<script');
    expect(html).toMatch(/--overlay-filter:\s*blur\(/);
    // Kelas kartu putih hanya di <section> dialog, bukan di lapisan inner selebar layar.
    expect(html.match(/modalContent/g)).toHaveLength(1);
    expect(html).toMatch(/<section[^>]*modalContent/);
  });

  it('tanpa data info: kotak Lokasi/Pengelola/Status tampil "–" (+ teks pembaca layar), galeri disembunyikan', () => {
    const html = render(<PotensiDetailModal item={item} opened onClose={() => {}} />);
    for (const label of Object.values(POTENSI_TEXT.info)) expect(html).toMatch(new RegExp(`<dt[^>]*>${label}</dt>`));
    expect(html.match(/<dd/g)).toHaveLength(3);
    expect(html.match(new RegExp(`>${POTENSI_TEXT.emptyValue}<`, 'g'))).toHaveLength(3);
    expect(html).toContain(POTENSI_TEXT.emptyValueLabel);
    expect(html).not.toContain(POTENSI_TEXT.dokumentasi);
  });

  it('dengan data info & dokumentasi: nilai tampil, status berkelas hijau, foto ber-alt', () => {
    const full = {
      ...item,
      lokasi: 'Subak Darmasaba',
      pengelola: 'Pokdarwis Desa',
      status: 'Buka untuk Umum',
      dokumentasi: [{ id: 'd1', link: 'https://example.test/d1.jpg' }, { id: 'd2', link: 'https://example.test/d2.jpg' }],
    };
    const html = render(<PotensiDetailModal item={full} opened onClose={() => {}} />);
    expect(html).toMatch(/<dd[^>]*>Subak Darmasaba<\/dd>/);
    expect(html).toMatch(/<dd[^>]*>Pokdarwis Desa<\/dd>/);
    expect(html).toMatch(/<dd[^>]*infoStatus[^>]*>Buka untuk Umum<\/dd>/);
    expect(html).not.toContain(POTENSI_TEXT.emptyValueLabel);
    expect(html).toMatch(new RegExp(`<h3[^>]*>${POTENSI_TEXT.dokumentasi}</h3>`));
    expect(html).toContain(`alt="${POTENSI_TEXT.dokumentasiAlt(item.name, 2)}"`);
    expect(html).toContain('https://example.test/d2.jpg');
  });

  it('konten kosong menampilkan teks pengganti', () => {
    const html = render(<PotensiDetailModal item={{ ...item, content: '<p></p>' }} opened onClose={() => {}} />);
    expect(html).toContain(POTENSI_TEXT.emptyDescription);
  });

  it('tertutup atau tanpa item = tidak ada dialog', () => {
    expect(render(<PotensiDetailModal item={item} opened={false} onClose={() => {}} />)).not.toContain('role="dialog"');
    expect(render(<PotensiDetailModal item={null} opened onClose={() => {}} />)).not.toContain('role="dialog"');
  });
});
