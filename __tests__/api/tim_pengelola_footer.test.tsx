// @vitest-environment node
// Footer publik: nomor SK Tim Pengelola Website. Tiga keadaan baris SK: tertaut ke PDF (tab baru, rel aman), teks biasa
// (nomor ada, PDF belum), dan tersembunyi (nomor kosong / belum diisi / memuat / gagal). Tautan "Tim Pengelola" ke situs
// tim tetap ada, dan daftar anggota TIDAK pernah tampil di publik. jsdom rusak → renderToStaticMarkup (efek tidak berjalan).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { FooterKontakDesa } from '@/app/(public)/_com/FooterKontakDesa';
import kontakState from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import timState from '@/app/admin/(dashboard)/_state/desa/timPengelola';
import type { KontakDesaRecord } from '@/lib/kontak-desa';
import type { TimPengelolaPublicRecord } from '@/lib/tim-pengelola';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, '');

// test-only: data rekaan (bukan nomor/nama SK sebenarnya).
const KONTAK: KontakDesaRecord = {
  id: 'kontak-desa',
  namaKantor: 'Kantor Uji Desa',
  alamat: 'Jl. Uji No. 1, Desa Uji',
  telepon: '(0361) 8441518',
  email: 'kontak-uji@example.com',
  whatsapp: null,
  jamLayanan: null,
  updatedAt: '2026-11-19T00:00:00.000Z',
};
const TIM: TimPengelolaPublicRecord = {
  id: 'tim-pengelola-website',
  nomorSk: '99 Tahun 2026',
  tanggalSk: '2026-01-12T00:00:00.000Z',
  skFile: { id: 'file-1', link: '/api/img/sk-uji.pdf', realName: 'sk-uji.pdf' },
  updatedAt: '2026-11-20T00:00:00.000Z',
};
const anchorSk = (html: string) => html.match(/<a[^>]*href="\/api\/img\/sk-uji\.pdf"[^>]*>[^<]*<\/a>/)?.[0] ?? '';

beforeEach(() => {
  Object.assign(kontakState.findUnique, { data: KONTAK, loaded: true, loading: false, error: null });
  Object.assign(timState.findUnique, { data: null, loaded: false, loading: false, error: null });
});

describe('Footer: baris SK Tim Pengelola', () => {
  it('nomor + PDF: "SK Perbekel Nomor {nomor}" menjadi tautan ke PDF, tab baru dengan rel aman', () => {
    timState.findUnique.data = TIM;
    const html = render(<FooterKontakDesa />);
    const anchor = anchorSk(html);
    expect(anchor).toContain('SK Perbekel Nomor 99 Tahun 2026');
    expect(anchor).toContain('target="_blank"');
    expect(anchor).toContain('rel="noopener noreferrer"');
  });

  it('nomor tanpa PDF: teks biasa tanpa tautan', () => {
    timState.findUnique.data = { ...TIM, skFile: null };
    const html = render(<FooterKontakDesa />);
    expect(text(html)).toContain('SK Perbekel Nomor 99 Tahun 2026');
    expect(html).not.toContain('sk-uji.pdf');
    expect(html).not.toMatch(/<a[^>]*>SK Perbekel/);
  });

  it.each([
    ['kosong', ''],
    ['hanya spasi', '   '],
  ])('nomor %s: baris SK tidak tampil walau PDF ada', (_label, nomorSk) => {
    timState.findUnique.data = { ...TIM, nomorSk };
    const html = render(<FooterKontakDesa />);
    expect(html).not.toContain('SK Perbekel');
    expect(html).not.toContain('sk-uji.pdf');
  });

  it('belum diisi admin, memuat, atau gagal dimuat: tidak ada baris SK dan tidak ada nilai bawaan', () => {
    expect(render(<FooterKontakDesa />)).not.toContain('SK Perbekel');
    timState.findUnique.error = 'HTTP error! status: 500';
    expect(render(<FooterKontakDesa />)).not.toContain('SK Perbekel');
  });

  it('nomor SK dari admin ditampilkan apa adanya sebagai teks (tanda HTML tidak dieksekusi)', () => {
    timState.findUnique.data = { ...TIM, nomorSk: '<b>9</b>', skFile: null };
    const html = render(<FooterKontakDesa />);
    expect(html).not.toContain('<b>9</b>');
    expect(html).toContain('&lt;b&gt;9&lt;/b&gt;');
  });

  it('admin menyimpan nomor baru → footer menampilkan nomor baru (state bersama)', () => {
    timState.findUnique.data = TIM;
    expect(text(render(<FooterKontakDesa />))).toContain('99 Tahun 2026');
    timState.findUnique.data = { ...TIM, nomorSk: '100 Tahun 2026' };
    const html = text(render(<FooterKontakDesa />));
    expect(html).toContain('SK Perbekel Nomor 100 Tahun 2026');
    expect(html).not.toContain('99 Tahun 2026');
  });

  it('baris SK berada setelah baris "Pengelola website"', () => {
    timState.findUnique.data = TIM;
    const html = text(render(<FooterKontakDesa />));
    expect(html.indexOf('Pengelola website:')).toBeLessThan(html.indexOf('SK Perbekel Nomor'));
  });
});

describe('Footer: pengelola website dan anggota', () => {
  it('tautan "Tim Pengelola" ke cogniti.id tetap ada (tab baru, rel aman) bersama baris SK', () => {
    timState.findUnique.data = TIM;
    const html = render(<FooterKontakDesa />);
    const anchor = html.match(/<a[^>]*href="https:\/\/cogniti\.id\/"[^>]*>([^<]*)<\/a>/);
    expect(anchor?.[1]).toBe('Tim Pengelola');
    expect(anchor?.[0]).toContain('target="_blank"');
    expect(anchor?.[0]).toContain('rel="noopener noreferrer"');
  });

  it('anggota tidak pernah tampil di publik, bahkan bila data bersama tak sengaja memuatnya', () => {
    // test-only: nama fiktif; data admin lengkap memuat anggota, footer hanya boleh memakai nomor SK + tautan PDF.
    timState.findUnique.data = { ...TIM, anggota: [{ nama: 'Anggota Uji Rahasia', jabatan: 'Ketua' }] } as TimPengelolaPublicRecord;
    const html = render(<FooterKontakDesa />);
    expect(html).not.toContain('Anggota Uji Rahasia');
    expect(html).not.toContain('Ketua');
  });
});
