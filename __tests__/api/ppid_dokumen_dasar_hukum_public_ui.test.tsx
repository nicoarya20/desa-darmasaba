// @vitest-environment node
// Lomba 2.5: halaman publik Dasar Hukum menampilkan daftar dokumen PDF berurut dengan tautan "Lihat" (tab baru,
// terbaca di browser) dan "Unduh" (atribut download), tersembunyi bila belum ada dokumen, sementara teks dasar
// hukum lama tetap tampil. jsdom gagal start di repo ini → renderToStaticMarkup.
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dasarHukum = vi.hoisted(() => ({ findById: { data: null as unknown, loading: false, load: vi.fn() } }));
const dokumen = vi.hoisted(() => ({ list: { data: [] as unknown[], loading: false, load: vi.fn() } }));

vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum', () => ({ default: dasarHukum }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dokumenDasarHukum', () => ({ default: dokumen }));

import DasarHukumPage from '@/app/(public)/(pages)/ppid/dasar-hukum/page';
import { DokumenDasarHukumSection } from '@/app/(public)/(pages)/ppid/dasar-hukum/_com/DokumenDasarHukumSection';
import { DASAR_HUKUM_TEXT as T } from '@/app/(public)/(pages)/ppid/dasar-hukum/_com/dasar-hukum.text';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const anchors = (html: string) => [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);

// test-only: baris dan berkas rekaan; urutan array = urutan tampil (server sudah mengurutkan).
const DASAR_HTML = '<ul><li>UU Uji Nomor 1 tentang Keterbukaan Uji</li><li>PP Uji Nomor 2</li></ul>';
const doc = (id: string, judul: string) => ({
  id,
  judul,
  urutan: 0,
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}.pdf`, realName: `${id}-asli.pdf` },
});
const DOCS = [doc('a', 'Perdes Uji Nomor 1'), doc('b', 'SK Perbekel Uji'), doc('c', 'SOP Layanan Uji')];

beforeEach(() => {
  dasarHukum.findById.data = { id: '1', judul: 'JUDUL UJI PPID', content: DASAR_HTML };
  dokumen.list.data = [];
});

describe('Dokumen Dasar Hukum publik', () => {
  it('daftar tampil berurut sesuai data dengan judul tiap dokumen', () => {
    dokumen.list.data = DOCS;
    const html = render(<DasarHukumPage />);
    const pos = DOCS.map((d) => html.indexOf(d.judul));
    expect(pos.every((p) => p > 0)).toBe(true);
    expect(pos).toEqual([...pos].sort((x, y) => x - y));
    expect(html).toContain(`>${T.dokumenTitle}</h2>`);
    expect(html).toContain('aria-labelledby="ppid-dokumen-dasar-hukum"');
  });

  it('tiap dokumen punya "Lihat" (tab baru, aman) dan "Unduh" (download bernama berkas asli) ke berkas yang sama', () => {
    dokumen.list.data = DOCS;
    const tags = anchors(render(<DasarHukumPage />));
    expect(tags).toHaveLength(DOCS.length * 2);
    for (const d of DOCS) {
      const lihat = tags.find((t) => t.includes(`aria-label="${T.lihatLabel(d.judul)}"`)) ?? '';
      const unduh = tags.find((t) => t.includes(`aria-label="${T.unduhLabel(d.judul)}"`)) ?? '';
      expect(lihat).toContain(`href="${d.file.link}"`);
      expect(lihat).toContain('target="_blank"');
      expect(lihat).toContain('rel="noopener noreferrer"');
      expect(lihat).not.toContain('download');
      expect(unduh).toContain(`href="${d.file.link}"`);
      expect(unduh).toContain(`download="${d.file.realName}"`);
      expect(unduh).not.toContain('target=');
    }
  });

  it('label tautan memakai link-reveal (data-text) tanpa garis bawah hover', () => {
    dokumen.list.data = [DOCS[0]];
    const html = render(<DasarHukumPage />);
    expect(html).toContain(`data-text="${T.lihat}">${T.lihat}</span>`);
    expect(html).toContain(`data-text="${T.unduh}">${T.unduh}</span>`);
    expect(html).not.toMatch(/text-decoration|underline/);
  });

  it('belum ada dokumen: bagian tersembunyi sepenuhnya, teks dasar hukum tetap tampil', () => {
    const html = render(<DasarHukumPage />);
    expect(html).not.toContain(T.dokumenTitle);
    expect(html).not.toContain('ppid-dokumen-dasar-hukum');
    expect(anchors(html)).toHaveLength(0);
    expect(html).toContain('UU Uji Nomor 1');
    expect(html).toContain('JUDUL UJI PPID');
  });

  it('teks dasar hukum lama tetap utuh di samping daftar dokumen', () => {
    dokumen.list.data = DOCS;
    const html = render(<DasarHukumPage />);
    expect(html).toContain('UU Uji Nomor 1');
    expect(html).toContain('PP Uji Nomor 2');
    expect(html).toContain('aria-labelledby="ppid-dasar-hukum"');
  });

  it('hanya dokumen tanpa baris teks: dokumen tetap tampil, bukan pesan kosong', () => {
    dasarHukum.findById.data = null;
    dokumen.list.data = [DOCS[0]];
    const html = render(<DasarHukumPage />);
    expect(html).toContain(DOCS[0].judul);
    expect(html).not.toContain(T.empty);
  });

  it('komponen bagian: daftar kosong tidak merender apa pun', () => {
    expect(render(<DokumenDasarHukumSection items={[]} />)).toBe('');
  });

  it('judul dokumen dirender sebagai teks (HTML di judul tidak dieksekusi)', () => {
    dokumen.list.data = [doc('x', '<img src=x onerror=alert(1)>')];
    const html = render(<DasarHukumPage />);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
