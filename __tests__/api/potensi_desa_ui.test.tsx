// @vitest-environment node
// Halaman Potensi Desa: kartu (judul kiri bawah + deskripsi) dan overlay detail (bukan pindah halaman).
// Catatan: environment jsdom gagal start di repo ini (require ESM ber-top-level-await di cssstyle), jadi
// markup diuji via renderToStaticMarkup; DOMPurify (butuh DOM) diganti stub yang mencatat opsi.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, ModalRoot } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sanitize = vi.hoisted(() => vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')));
vi.mock('dompurify', () => ({ default: { sanitize } }));

import { PotensiCard } from '@/app/darmasaba/(pages)/pemerintahan/potensi/_com/PotensiCard';
import { PotensiDetailModal } from '@/app/darmasaba/(pages)/pemerintahan/potensi/_com/PotensiDetailModal';
import {
  RICH_TEXT_TAGS,
  htmlToPlainText,
  sanitizePotensiHtml,
  type PotensiItem,
} from '@/app/darmasaba/(pages)/pemerintahan/potensi/_com/potensi.logic';
import { POTENSI_TEXT } from '@/app/darmasaba/(pages)/pemerintahan/potensi/_com/potensi.text';

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
    expect(html).not.toContain('/darmasaba/desa/potensi/p1');
  });

  it('tanpa deskripsi → tidak ada paragraf kosong', () => {
    const empty = render(<PotensiCard item={{ ...item, deskripsi: '<p></p>' }} onOpen={() => {}} />);
    expect(empty).not.toMatch(/<p[^>]*><\/p>/);
  });
});

describe('PotensiDetailModal', () => {
  it('dialog: hero (kategori + judul), tombol tutup, deskripsi lengkap tersanitasi, latar blur', () => {
    const html = render(<PotensiDetailModal item={item} opened onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toMatch(/<h2[^>]*>Taman Beji Cengana<\/h2>/);
    expect(html).toContain('>Wisata<');
    expect(html).toContain(`aria-label="${POTENSI_TEXT.close}"`);
    expect(html).toContain(POTENSI_TEXT.fullDescription);
    expect(html).toContain('<p>Taman Beji memadukan unsur spiritual.</p>');
    expect(html).not.toContain('<script');
    expect(html).toMatch(/--overlay-filter:\s*blur\(/);
    // Kelas kartu putih hanya di <section> dialog, bukan di lapisan inner selebar layar.
    expect(html.match(/modalContent/g)).toHaveLength(1);
    expect(html).toMatch(/<section[^>]*modalContent/);
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
