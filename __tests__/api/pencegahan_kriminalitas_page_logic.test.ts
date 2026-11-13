// @vitest-environment node
// Pencegahan Kriminalitas publik: parse ID YouTube, normalisasi item, susunan sorotan + kartu + paginasi.
import { describe, expect, it } from 'vitest';
import {
  arrangePencegahan,
  externalVideoHref,
  pencegahanDetailHref,
  pencegahanListHref,
  toPencegahanItem,
  youtubeEmbedUrl,
  youtubeId,
  youtubeThumbUrl,
  type PencegahanItem,
} from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.logic';

const ID = '9eCnhJvdv6A';

describe('youtubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=9eCnhJvdv6A', ID],
    ['https://youtube.com/watch?feature=share&v=9eCnhJvdv6A&t=30', ID],
    ['https://m.youtube.com/watch?v=9eCnhJvdv6A', ID],
    ['https://youtu.be/9eCnhJvdv6A', ID],
    ['https://youtu.be/9eCnhJvdv6A?si=abc', ID],
    ['https://www.youtube.com/embed/9eCnhJvdv6A', ID],
    ['https://www.youtube-nocookie.com/embed/9eCnhJvdv6A?rel=0', ID],
    ['https://www.youtube.com/shorts/9eCnhJvdv6A', ID],
    ['https://www.youtube.com/live/9eCnhJvdv6A', ID],
    ['  https://www.youtube.com/embed/9eCnhJvdv6A  ', ID],
  ])('%s → ID', (url, expected) => {
    expect(youtubeId(url)).toBe(expected);
  });

  it.each([
    [null],
    [undefined],
    [''],
    ['   '],
    ['bukan url'],
    ['javascript:alert(1)'],
    ['https://vimeo.com/123456789'],
    ['https://www.youtube.com/watch'],
    ['https://www.youtube.com/watch?v=pendek'],
    ['https://www.youtube.com/embed/'],
    ['https://www.youtube.com/channel/UC1234567890'],
    ['https://evil.example/embed/9eCnhJvdv6A'],
    ['https://youtube.com.evil.example/watch?v=9eCnhJvdv6A'],
    ['https://youtu.be/9eCnhJvdv6A"onload="x'],
  ])('%s → null', (url) => {
    expect(youtubeId(url)).toBeNull();
  });

  it('URL pratinjau & pemutar dari ID', () => {
    expect(youtubeThumbUrl(ID)).toBe('https://i.ytimg.com/vi/9eCnhJvdv6A/hqdefault.jpg');
    expect(youtubeEmbedUrl(ID)).toBe('https://www.youtube-nocookie.com/embed/9eCnhJvdv6A?autoplay=1&rel=0&playsinline=1');
  });
});

describe('externalVideoHref', () => {
  it('URL http(s) non-YouTube → tautan; YouTube / tidak valid → null', () => {
    expect(externalVideoHref('https://vimeo.com/123456789')).toBe('https://vimeo.com/123456789');
    expect(externalVideoHref(`https://youtu.be/${ID}`)).toBeNull();
    expect(externalVideoHref('javascript:alert(1)')).toBeNull();
    expect(externalVideoHref('teks bebas')).toBeNull();
    expect(externalVideoHref('')).toBeNull();
  });
});

describe('href', () => {
  it('detail di-encode, daftar tanpa query kosong', () => {
    expect(pencegahanDetailHref('a b')).toBe('/keamanan/pencegahan-kriminalitas/a%20b');
    expect(pencegahanListHref()).toBe('/keamanan/pencegahan-kriminalitas');
    expect(pencegahanListHref({ search: ' maling ', page: 2 })).toBe('/keamanan/pencegahan-kriminalitas?search=maling&page=2');
    expect(pencegahanListHref({ page: 1 })).toBe('/keamanan/pencegahan-kriminalitas');
  });
});

describe('toPencegahanItem', () => {
  it('HTML ringkasan → teks polos, video valid → videoId, tanggal → epoch', () => {
    const item = toPencegahanItem({
      id: 'cms4d19gx001tp80r7279vh6q',
      judul: ' Mencegah Pencurian di Lingkungan Rumah ',
      deskripsiSingkat: '<p>Pencurian rumah &amp; kewaspadaan.</p>',
      linkVideo: 'https://www.youtube.com/embed/RJOv2S0LhJQ',
      createdAt: '2026-07-28T07:54:34.161Z',
    });
    expect(item).toEqual({
      id: 'cms4d19gx001tp80r7279vh6q',
      title: 'Mencegah Pencurian di Lingkungan Rumah',
      summary: 'Pencurian rumah & kewaspadaan.',
      videoId: 'RJOv2S0LhJQ',
      createdAt: Date.parse('2026-07-28T07:54:34.161Z'),
      href: '/keamanan/pencegahan-kriminalitas/cms4d19gx001tp80r7279vh6q',
    });
  });

  it('linkVideo tidak valid → tanpa videoId', () => {
    const item = toPencegahanItem({ id: 'x', judul: 'X', linkVideo: 'bukan url', createdAt: '2026-01-01T00:00:00Z' });
    expect(item.videoId).toBeUndefined();
  });
});

describe('arrangePencegahan', () => {
  const item = (i: number): PencegahanItem => ({ id: `p${i}`, title: `P${i}`, summary: '', createdAt: i, href: `/p${i}` });
  const items = (n: number) => Array.from({ length: n }, (_, i) => item(i + 1));
  const ids = (list: PencegahanItem[]) => list.map((p) => p.id);

  it('halaman 1 tanpa cari: entri pertama jadi sorotan dan tidak dobel di kartu', () => {
    const view = arrangePencegahan(items(4), { search: '', page: 1, size: 6 });
    expect(view.sorotan?.id).toBe('p1');
    expect(ids(view.cards)).toEqual(['p2', 'p3', 'p4']);
    expect(view.totalPages).toBe(1);
  });

  it('paginasi dihitung setelah sorotan dikeluarkan (13 entri → 12 kartu → 2 halaman)', () => {
    const p1 = arrangePencegahan(items(13), { search: '', page: 1, size: 6 });
    expect(ids(p1.cards)).toEqual(['p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
    expect(p1.totalPages).toBe(2);
    const p2 = arrangePencegahan(items(13), { search: '', page: 2, size: 6 });
    expect(p2.sorotan).toBeUndefined();
    expect(ids(p2.cards)).toEqual(['p8', 'p9', 'p10', 'p11', 'p12', 'p13']);
    expect(p2.totalPages).toBe(2);
  });

  it('dengan kata kunci: tanpa sorotan, semua hasil jadi kartu', () => {
    const view = arrangePencegahan(items(3), { search: 'maling', page: 1, size: 6 });
    expect(view.sorotan).toBeUndefined();
    expect(ids(view.cards)).toEqual(['p1', 'p2', 'p3']);
  });

  it('1 entri: hanya sorotan, tanpa kartu', () => {
    const view = arrangePencegahan(items(1), { search: '', page: 1, size: 6 });
    expect(view.sorotan?.id).toBe('p1');
    expect(view.cards).toEqual([]);
    expect(view.totalPages).toBe(1);
  });

  it('halaman di luar jangkauan → halaman terakhir (sorotan ikut bila itu halaman 1)', () => {
    const view = arrangePencegahan(items(4), { search: '', page: 9, size: 6 });
    expect(view.page).toBe(1);
    expect(view.sorotan?.id).toBe('p1');
    const view2 = arrangePencegahan(items(13), { search: '', page: 9, size: 6 });
    expect(view2.page).toBe(2);
    expect(view2.sorotan).toBeUndefined();
  });

  it('kosong → tanpa sorotan & kartu', () => {
    expect(arrangePencegahan([], { search: '', page: 1, size: 6 })).toEqual({ sorotan: undefined, cards: [], page: 1, totalPages: 1 });
  });
});
