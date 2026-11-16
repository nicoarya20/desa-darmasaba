// @vitest-environment node
// Kesejahteraan Masyarakat publik: normalisasi kartu, cari klien, sorotan tidak dobel, pesan kosong, detail aman.
import { describe, expect, it } from 'vitest';
import {
  arrangeKesejahteraan,
  filterKesejahteraan,
  kesejahteraanDetailHref,
  kesejahteraanEmptyMessage,
  kesejahteraanListHref,
  toKesejahteraanDetail,
  toKesejahteraanItem,
} from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/kesejahteraan.logic';

// test-only: bentuk entri stg 2026-11-16 (seed kesmas-1..6, dipangkas).
const api = (i: number, extra: Record<string, unknown> = {}) => ({
  id: `kesmas-${i}`,
  judul: ` Program ${i} `,
  deskripsi: `<p>Ringkasan BLT &amp; bantuan ${i}</p>`,
  content: `<p>Isi lengkap PKH ${i}</p>`,
  linkVideo: null,
  image: null,
  ...extra,
});
const items = (n: number) => Array.from({ length: n }, (_, i) => toKesejahteraanItem(api(i + 1)));
const identity = (html: string) => html;

describe('URL', () => {
  it('detail & daftar', () => {
    expect(kesejahteraanDetailHref('kesmas 1')).toBe('/ekonomi/kesejahteraan-masyarakat/kesmas%201');
    expect(kesejahteraanListHref()).toBe('/ekonomi/kesejahteraan-masyarakat');
    expect(kesejahteraanListHref({ search: ' bansos ', page: 2 })).toBe('/ekonomi/kesejahteraan-masyarakat?search=bansos&page=2');
    expect(kesejahteraanListHref({ page: 1 })).toBe('/ekonomi/kesejahteraan-masyarakat');
  });
});

describe('toKesejahteraanItem', () => {
  it('judul dirapikan, ringkasan teks polos dari HTML, tanpa foto → imageUrl kosong (bukan placeholder)', () => {
    const item = toKesejahteraanItem(api(1));
    expect(item).toMatchObject({
      id: 'kesmas-1',
      title: 'Program 1',
      summary: 'Ringkasan BLT & bantuan 1',
      href: '/ekonomi/kesejahteraan-masyarakat/kesmas-1',
    });
    expect(item.imageUrl).toBeUndefined();
    expect(JSON.stringify(item)).not.toContain('placeholderx');
  });

  it('foto utama dipakai bila ada', () => {
    expect(toKesejahteraanItem(api(1, { image: { link: '/api/img/a.webp' } })).imageUrl).toBe('/api/img/a.webp');
  });

  it('ringkasan tanpa tag/skrip mentah', () => {
    const item = toKesejahteraanItem(api(1, { deskripsi: '<p>Aman</p><img src=x onerror="alert(1)">' }));
    expect(item.summary).toBe('Aman');
  });
});

describe('filterKesejahteraan', () => {
  it('semua kata harus muncul di judul, ringkasan, atau isi (tidak peka huruf besar)', () => {
    const list = items(3);
    expect(filterKesejahteraan(list, 'pkh 2').map((i) => i.id)).toEqual(['kesmas-2']);
    expect(filterKesejahteraan(list, 'BLT')).toHaveLength(3);
    expect(filterKesejahteraan(list, 'blt zzz')).toHaveLength(0);
    expect(filterKesejahteraan(list, '  ')).toHaveLength(3);
  });
});

describe('arrangeKesejahteraan', () => {
  it('tanpa kata kunci: entri pertama jadi sorotan dan TIDAK ikut kartu', () => {
    const view = arrangeKesejahteraan(items(4), { search: '', page: 1, size: 6 });
    expect(view.sorotan?.id).toBe('kesmas-1');
    expect(view.cards.map((i) => i.id)).toEqual(['kesmas-2', 'kesmas-3', 'kesmas-4']);
  });

  it('halaman 2: tanpa sorotan, kartu mulai offset 1 + 6', () => {
    const view = arrangeKesejahteraan(items(9), { search: '', page: 2, size: 6 });
    expect(view.sorotan).toBeUndefined();
    expect(view.cards.map((i) => i.id)).toEqual(['kesmas-8', 'kesmas-9']);
    expect(view.totalPages).toBe(2);
  });

  it('dengan kata kunci: semua hasil jadi kartu, tanpa sorotan', () => {
    const view = arrangeKesejahteraan(items(3), { search: 'program', page: 1, size: 6 });
    expect(view.sorotan).toBeUndefined();
    expect(view.cards).toHaveLength(3);
  });

  it('halaman di luar jangkauan → halaman terakhir; hanya 1 entri → sorotan saja', () => {
    expect(arrangeKesejahteraan(items(9), { search: '', page: 9, size: 6 }).page).toBe(2);
    const single = arrangeKesejahteraan(items(1), { search: '', page: 3, size: 6 });
    expect(single.sorotan?.id).toBe('kesmas-1');
    expect(single.cards).toHaveLength(0);
  });

  it('kosong → tanpa sorotan & kartu', () => {
    expect(arrangeKesejahteraan([], { search: '', page: 1, size: 6 })).toMatchObject({ sorotan: undefined, cards: [] });
  });
});

describe('kesejahteraanEmptyMessage', () => {
  it('galat, cari tanpa hasil, dan belum ada data dibedakan', () => {
    expect(kesejahteraanEmptyMessage('', true)).toBe('Program kesejahteraan gagal dimuat. Coba muat ulang halaman.');
    expect(kesejahteraanEmptyMessage(' rtlh ', false)).toBe('Tidak ada program kesejahteraan yang cocok dengan “rtlh”.');
    expect(kesejahteraanEmptyMessage('', false)).toBe('Kabar program kesejahteraan masyarakat akan tampil di sini.');
  });
});

describe('toKesejahteraanDetail', () => {
  it('deskripsi & isi lewat sanitize; HTML kosong editor → bagian tidak ada', () => {
    const seen: string[] = [];
    const detail = toKesejahteraanDetail(api(1), (html) => {
      seen.push(html);
      return `[aman]${html}`;
    });
    expect(seen).toEqual(['<p>Ringkasan BLT &amp; bantuan 1</p>', '<p>Isi lengkap PKH 1</p>']);
    expect(detail.leadHtml).toBe('[aman]<p>Ringkasan BLT &amp; bantuan 1</p>');
    expect(detail.html).toBe('[aman]<p>Isi lengkap PKH 1</p>');
    expect(detail.title).toBe('Program 1');

    const blank = toKesejahteraanDetail(api(1, { deskripsi: '<p></p>', content: '' }), () => '');
    expect(blank.leadHtml).toBeUndefined();
    expect(blank.html).toBeUndefined();
  });

  it('video: YouTube (watch/embed) → id fasad; URL lain → tautan tab baru; teks/javascript: → tanpa video', () => {
    expect(toKesejahteraanDetail(api(1, { linkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }), identity)).toMatchObject({
      videoId: 'dQw4w9WgXcQ',
      videoHref: undefined,
    });
    expect(toKesejahteraanDetail(api(1, { linkVideo: 'https://youtu.be/dQw4w9WgXcQ' }), identity).videoId).toBe('dQw4w9WgXcQ');
    expect(toKesejahteraanDetail(api(1, { linkVideo: 'https://vimeo.com/1' }), identity)).toMatchObject({
      videoId: undefined,
      videoHref: 'https://vimeo.com/1',
    });
    for (const linkVideo of ['javascript:alert(1)', 'bukan url', '', null]) {
      expect(toKesejahteraanDetail(api(1, { linkVideo }), identity)).toMatchObject({ videoId: undefined, videoHref: undefined });
    }
  });

  it('foto utama & galeri: gambar tanpa link/id dibuang', () => {
    const detail = toKesejahteraanDetail(
      api(1, {
        image: { link: '/api/img/utama.webp' },
        images: [
          { id: 'g1', link: '/api/img/g1.webp', realName: 'g1.jpg' },
          { id: 'g2', link: '' },
          { link: '/api/img/g3.webp' },
        ],
      }),
      identity,
    );
    expect(detail.imageUrl).toBe('/api/img/utama.webp');
    expect(detail.galeri).toEqual([{ id: 'g1', link: '/api/img/g1.webp', realName: 'g1.jpg' }]);
    expect(toKesejahteraanDetail(api(1), identity).galeri).toEqual([]);
  });
});
