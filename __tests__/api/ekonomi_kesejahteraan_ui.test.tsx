// @vitest-environment node
// Kesejahteraan Masyarakat publik: sorotan teks saja/berfoto + kartu Kabar (tanpa tanggal), keadaan memuat/kosong/galat,
// tautan silang ke Program Kemiskinan, detail 860px tanpa iframe mentah.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { KesejahteraanBody } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/KesejahteraanPage';
import { ProgramKemiskinanLink } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/ProgramKemiskinanLink';
import { KesejahteraanDetailBody } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/detail/KesejahteraanDetail';
import {
  toKesejahteraanDetail,
  toKesejahteraanItem,
} from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/kesejahteraan.logic';
import s from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/kesejahteraan.module.css';
import sd from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/detail/kesejahteraan-detail.module.css';
import terkait from '@/app/(public)/(pages)/ekonomi/_com/terkait/terkait.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (seed kesmas-1..6, tanpa foto; dipangkas).
const api = (i: number, extra: Record<string, unknown> = {}) => ({
  id: `kesmas-${i}`,
  judul: `Program ${i}`,
  deskripsi: `<p>Ringkasan &amp; bantuan ${i}</p>`,
  content: `<p>Isi ${i}</p>`,
  image: null,
  ...extra,
});
const ready = (list: ReturnType<typeof api>[]) => ({ status: 'ready' as const, data: list.map(toKesejahteraanItem) });
const body = (state: Parameters<typeof KesejahteraanBody>[0]['state'], search = '', page = 1) =>
  render(<KesejahteraanBody state={state} search={search} page={page} onPage={() => {}} />);
const identity = (html: string) => html;

describe('KesejahteraanBody', () => {
  it('sorotan tanpa foto = ubin teks saja (tanpa gambar/placeholder), seluruh ubin tautan detail', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).toContain(`<a href="/ekonomi/kesejahteraan-masyarakat/kesmas-1" class="${s.plain} ${r.trigger}">`);
    expect(html).toContain(`<span class="${r.cta}" data-text="Baca selengkapnya">Baca selengkapnya</span>`);
    expect(html).toContain(`<h2 class="${kabar.featuredTitle}"><span class="${r.title}">Program 1</span></h2>`);
    expect(html).toContain(`<span class="${s.label}">Terbaru</span>`);
    expect(html).toContain('Ringkasan &amp; bantuan 1');
    expect(html).not.toContain('placeholderx');
    expect(html).not.toContain('no-image');
  });

  it('sorotan berfoto = kartu utama Kabar', () => {
    const html = body(ready([api(1, { image: { link: '/api/img/a.webp' } }), api(2)]));
    expect(html).toContain(`class="${kabar.featured} ${r.trigger}"`);
    expect(html).toContain(`<h2 class="${kabar.featuredTitle}"><span class="${r.title}">Program 1</span></h2>`);
    expect(html).toContain(`<span class="${s.more}" aria-hidden="true"><span class="${r.cta}" data-text="Baca selengkapnya">`);
    expect(html).toMatch(new RegExp(`<svg[^>]*class="[^"]*\\b${r.chevron}\\b`));
    expect(html).toContain('src="/api/img/a.webp"');
  });

  it('kartu Kabar tanpa tanggal; sorotan tidak menggandakan kartu pertama', () => {
    const html = body(ready([api(1), api(2), api(3)]));
    expect(html).toContain(`class="${kabar.rail} ${kabar.railGrid}"`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}"><span class="${r.title}">Program 2</span></h3>`);
    expect(html).not.toContain(`<h3 class="${kabar.cardTitle}"><span class="${r.title}">Program 1</span></h3>`);
    expect(html.match(/>Program 1</g)).toHaveLength(1);
    expect(html).toContain('>Program lainnya</h2>');
    expect(html).toContain(kabar.photoFallback);
    expect(html).not.toContain('<time');
  });

  it('cari: tanpa sorotan, judul "Hasil pencarian", hanya yang cocok', () => {
    const html = body(ready([api(1), api(2, { judul: 'Bedah Rumah' })]), 'bedah');
    expect(html).not.toContain(kabar.featuredTitle);
    expect(html).toContain('>Hasil pencarian</h2>');
    expect(html).toContain(`<h3 class="${kabar.cardTitle}"><span class="${r.title}">Bedah Rumah</span></h3>`);
    expect(html).not.toContain('>Program 1</span></h3>');
  });

  it('paginasi hanya bila > 1 halaman', () => {
    expect(body(ready([api(1), api(2)]))).not.toContain('Halaman daftar program kesejahteraan');
    const many = body(ready(Array.from({ length: 8 }, (_, i) => api(i + 1))));
    expect(many).toContain('aria-label="Halaman daftar program kesejahteraan"');
  });

  it('kosong / cari tanpa hasil / galat → kotak satu kalimat', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Kabar program kesejahteraan masyarakat akan tampil di sini.</p>`);
    expect(body(ready([api(1)]), 'zzz')).toContain('Tidak ada program kesejahteraan yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain('Program kesejahteraan gagal dimuat. Coba muat ulang halaman.');
  });

  it('memuat: aria-busy, kerangka sorotan hanya di halaman 1 tanpa cari', () => {
    expect(body({ status: 'loading' })).toContain('aria-busy="true"');
    expect(body({ status: 'loading' })).toContain(`${kabar.featured} ${kabar.placeholder}`);
    expect(body({ status: 'loading' }, 'x')).not.toContain(kabar.featured);
  });

  it('tanpa gaya lama (Badge "KESEJAHTERAAN", tombol "Baca Selengkapnya" kapital)', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).not.toContain('>Kesejahteraan<');
    expect(html).not.toContain('Baca Selengkapnya');
  });
});

describe('ProgramKemiskinanLink', () => {
  it('ubin tautan silang ke /ekonomi/program-kemiskinan', () => {
    const html = render(<ProgramKemiskinanLink />);
    expect(html).toContain('aria-label="Halaman terkait"');
    expect(html).toContain(`<a href="/ekonomi/program-kemiskinan" class="${terkait.terkait} ${r.trigger}">`);
    expect(html).toContain('>Program Pengentasan Kemiskinan</h2>');
    expect(html).toContain(`<span class="${r.cta}" data-text="Lihat program">Lihat program</span>`);
  });
});

describe('KesejahteraanDetailBody', () => {
  const detail = (extra: Record<string, unknown> = {}) => toKesejahteraanDetail(api(1, extra), identity);

  it('kategori = tautan daftar, h1, pengantar, isi; tanpa tanggal', () => {
    const html = render(<KesejahteraanDetailBody detail={detail()} />);
    expect(html).toContain(
      `<a href="/ekonomi/kesejahteraan-masyarakat" class="${d.kategori} ${r.trigger}"><span class="${r.cta}" data-text="Kesejahteraan Masyarakat">Kesejahteraan Masyarakat</span></a>`,
    );
    expect(html).toContain(`<h1 class="${d.title}">Program 1</h1>`);
    expect(html).toContain('<p>Ringkasan &amp; bantuan 1</p>');
    // Wadah isi boleh memuat kelas tambahan; wajib d.content + penetral rich text rt.root (dark theme).
    const isi = html.match(/<div class="([^"]*)"><p>Isi 1<\/p><\/div>/);
    expect(isi?.[1].split(' ')).toEqual(expect.arrayContaining([d.content, rt.root]));
    expect(html).not.toContain('<time');
    expect(html).not.toContain('Deskripsi Program');
  });

  it('video YouTube → fasad (tanpa iframe sebelum diklik); URL lain → tautan tab baru', () => {
    const yt = render(<KesejahteraanDetailBody detail={detail({ linkVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ' })} />);
    expect(yt).toContain('data-video-id="dQw4w9WgXcQ"');
    expect(yt).not.toContain('<iframe');

    const other = render(<KesejahteraanDetailBody detail={detail({ linkVideo: 'https://example.com/v.mp4' })} />);
    expect(other).not.toContain('<iframe');
    expect(other).toContain(
      `href="https://example.com/v.mp4" target="_blank" rel="noopener noreferrer" class="${sd.videoLink} ${r.trigger}"><span class="${r.cta}" data-text="Buka video di tab baru">Buka video di tab baru</span><svg`,
    );
  });

  it('foto & galeri dirender bila ada; tanpa keduanya bagian tidak dirender', () => {
    const full = render(
      <KesejahteraanDetailBody
        detail={detail({ image: { link: '/api/img/u.webp' }, images: [{ id: 'g1', link: '/api/img/g1.webp' }] })}
      />,
    );
    expect(full).toContain('href="/api/img/u.webp" target="_blank"');
    expect(full).toContain('>Galeri foto</h2>');
    expect(full).toContain('src="/api/img/g1.webp"');

    const bare = render(<KesejahteraanDetailBody detail={detail({ content: '', deskripsi: '' })} />);
    expect(bare).not.toContain(d.photo);
    expect(bare).not.toContain('Galeri foto');
    expect(bare).not.toContain(d.content);
  });
});
