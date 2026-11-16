// @vitest-environment node
// Kolaborasi Inovasi: daftar baris per tahun (keadaan muat/kosong/galat, paginasi klien), baris dengan deskripsi
// terbuka di tempat, dan dinding logo Mitra Kolaborasi. Interaksi klik tombol diverifikasi manual (tanpa jsdom).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KolaborasiList } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/KolaborasiList';
import { KolaborasiRow } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/KolaborasiRow';
import { MitraWall } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/MitraWall';
import {
  sortKolaborasi,
  toKolaborasi,
  type Kolaborasi,
  type KolaborasiQuery,
} from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.logic';
import k from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.module.css';
import m from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/mitra.module.css';
import type { LoadState } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (dipangkas); sanitize diganti identitas karena DOMPurify butuh DOM.
const entri = (id: string, tahun: number, deskripsi = '<p>Program kerja sama desa.</p>'): Kolaborasi =>
  toKolaborasi(
    { id, name: `Kolaborasi ${id}`, tahun, slug: `Ringkasan ${id}`, deskripsi, kolaborator: `Mitra ${id}` },
    (html) => html,
  );
const ready = (items: Kolaborasi[]): LoadState<Kolaborasi[]> => ({ status: 'ready', data: sortKolaborasi(items) });
const semua: KolaborasiQuery = { tahun: null, search: '', page: 1 };
const list = (state: LoadState<Kolaborasi[]>, query: KolaborasiQuery = semua) =>
  render(<KolaborasiList state={state} query={query} onPage={() => {}} />);

describe('KolaborasiList', () => {
  it('dikelompokkan per tahun (h2, terbaru dulu), tiap entri baris h3 + ringkasan + deskripsi + "Bersama:"', () => {
    const html = list(ready([entri('a', 2025), entri('b', 2026)]));
    expect(html.indexOf('>2026</h2>')).toBeGreaterThan(-1);
    expect(html.indexOf('>2026</h2>')).toBeLessThan(html.indexOf('>2025</h2>'));
    expect(html).toContain(`<h3 class="${k.title}">Kolaborasi a</h3>`);
    expect(html).toContain(`<p class="${k.summary}">Ringkasan a</p>`);
    expect(html).toContain('<p>Program kerja sama desa.</p>');
    expect(html).toContain(`<span class="${k.partnersLabel}">Bersama:</span> Mitra a`);
    // Deskripsi pendek tampil penuh: tanpa tombol dan tanpa potongan.
    expect(html).not.toContain('aria-expanded');
    expect(html).not.toContain(k.clamped);
  });

  it('saring ?tahun= dan ?search= di klien', () => {
    const state = ready([entri('alpha', 2025), entri('beta', 2026)]);
    const html = list(state, { tahun: 2025, search: '', page: 1 });
    expect(html).toContain('Kolaborasi alpha');
    expect(html).not.toContain('Kolaborasi beta');
    const found = list(state, { tahun: null, search: 'mitra beta', page: 1 });
    expect(found).toContain('Kolaborasi beta');
    expect(found).not.toContain('Kolaborasi alpha');
  });

  it('paginasi klien 10 per halaman; 1 halaman → tanpa paginasi', () => {
    const many = Array.from({ length: 12 }, (_, i) => entri(`n${i}`, 2025));
    expect(list(ready(many.slice(0, 3)))).not.toContain('aria-label="Halaman daftar kolaborasi inovasi"');
    const page1 = list(ready(many));
    expect(page1).toContain('aria-label="Halaman daftar kolaborasi inovasi"');
    expect(page1).toContain('Kolaborasi n9<');
    expect(page1).not.toContain('Kolaborasi n10<');
    expect(list(ready(many), { ...semua, page: 2 })).toContain('Kolaborasi n11<');
  });

  it('memuat → kerangka aria-busy; kosong / tahun / cari / galat → kotak pesan', () => {
    const loading = list({ status: 'loading' });
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('aria-label="Memuat kolaborasi inovasi"');
    expect(list(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada kolaborasi inovasi.</p>`);
    expect(list(ready([entri('a', 2025)]), { ...semua, tahun: 2019 })).toContain(
      'Belum ada kolaborasi inovasi pada tahun 2019.',
    );
    expect(list(ready([entri('a', 2025)]), { ...semua, search: 'zzz' })).toContain(
      'Tidak ada kolaborasi inovasi yang cocok dengan “zzz”.',
    );
    expect(list({ status: 'error' })).toContain('Kolaborasi inovasi gagal dimuat. Coba muat ulang halaman.');
  });
});

describe('KolaborasiRow', () => {
  it('deskripsi > 600 karakter → terpotong + tombol "Baca selengkapnya" yang mengendalikan deskripsi', () => {
    const panjang = `<p>${'Kalimat panjang tentang kolaborasi desa. '.repeat(20)}</p>`;
    const html = render(<KolaborasiRow item={entri('a', 2025, panjang)} />);
    expect(html).toContain(`class="${k.prose} ${k.clamped}"`);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Baca selengkapnya');
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1];
    expect(controls).toBeTruthy();
    expect(html).toContain(`id="${controls}"`);
  });

  it('ringkasan berpola slug URL tidak ditampilkan', () => {
    const item = toKolaborasi(
      { id: 't', name: 'Forum Inovasi Desa (Tes)', tahun: 2026, slug: 'forum-inovasi-desa-tes', deskripsi: '', kolaborator: 'Ayu' },
      (html) => html,
    );
    const html = render(<KolaborasiRow item={item} />);
    expect(html).not.toContain('forum-inovasi-desa-tes');
    expect(html).not.toContain(k.summary);
  });
});

describe('MitraWall', () => {
  it('h2 + ubin logo (alt kosong, nama di bawah); tanpa logo → ikon', () => {
    const html = render(
      <MitraWall
        state={{
          status: 'ready',
          data: [
            { id: 'm1', name: 'BRI Peduli', logoUrl: '/api/img/bri-mobile.webp' },
            { id: 'm2', name: 'TP Posyandu Bali' },
          ],
        }}
      />,
    );
    expect(html).toContain('>Mitra Kolaborasi</h2>');
    expect(html).toContain('src="/api/img/bri-mobile.webp"');
    expect(html).toContain('alt=""');
    expect(html).toContain(`<p class="${m.name}">BRI Peduli</p>`);
    expect(html).toContain(`<p class="${m.name}">TP Posyandu Bali</p>`);
    expect(html.match(/<img/g)).toHaveLength(1);
  });

  it('memuat → ubin kerangka; galat atau tanpa mitra → bagian tidak dirender', () => {
    expect(render(<MitraWall state={{ status: 'loading' }} />)).toContain('aria-label="Memuat mitra kolaborasi"');
    expect(render(<MitraWall state={{ status: 'error' }} />)).not.toContain('Mitra Kolaborasi');
    expect(render(<MitraWall state={{ status: 'ready', data: [] }} />)).not.toContain('Mitra Kolaborasi');
  });
});
