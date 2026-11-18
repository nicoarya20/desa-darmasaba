// @vitest-environment node
// Keadaan sukses modal Ajukan Permohonan + info WhatsApp di halaman detail. jsdom rusak di repo ini → renderToStaticMarkup
// (klik/penyimpanan nyata tidak teruji di sini).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { LayananDetailBody } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/LayananDetail';
import { LAYANAN_DETAIL_TEXT as T } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/layanan-detail.text';
import { buildPermohonanWaUrl } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/permohonan-whatsapp.logic';
import { PermohonanTersimpan } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/PermohonanTersimpan';
import type { LayananDetailData } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/use-layanan-detail';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: respons pelayanansuratketerangan/{id}.
const data: LayananDetailData = {
  id: 's1',
  name: 'Surat Keterangan Domisili',
  deskripsi: '<p>Persyaratan</p>',
  image: { link: 'https://example.test/foto.jpg' },
  image2: null,
  estimasiWaktu: '1 hari kerja',
  biaya: 0,
};

describe('PermohonanTersimpan', () => {
  const waHref = buildPermohonanWaUrl({ nama: 'Made Wirawan', kategoriNama: 'Surat Keterangan Domisili' }) as string;

  it('tautan "Lanjutkan ke WhatsApp" = <a> wa.me nomor petugas, target _blank, rel noopener noreferrer', () => {
    const html = render(<PermohonanTersimpan waHref={waHref} onClose={() => {}} />);
    const anchor = html.match(/<a [^>]*>/)?.[0] ?? '';
    expect(anchor).toContain(`href="${waHref.replace(/&/g, '&amp;')}"`);
    expect(anchor).toContain('href="https://wa.me/6289674970658?text=');
    expect(anchor).toContain('target="_blank"');
    expect(anchor).toContain('rel="noopener noreferrer"');
    expect(html).toMatch(new RegExp(`<a [^>]*>[\\s\\S]*${T.lanjutWa}`));
  });

  it('menampilkan penjelasan sukses dan tombol Tutup', () => {
    const html = render(<PermohonanTersimpan waHref={waHref} onClose={() => {}} />);
    expect(html).toContain(T.tersimpanTitle);
    expect(html).toContain(T.tersimpanText);
    expect(html).toMatch(/<button[^>]*>[\s\S]*Tutup/);
  });

  it('tanpa tautan WhatsApp valid → tombol lanjut tidak dirender, tombol Tutup tetap ada', () => {
    const html = render(<PermohonanTersimpan waHref={null} onClose={() => {}} />);
    expect(html).not.toContain('<a ');
    expect(html).not.toContain(T.lanjutWa);
    expect(html).toContain('Tutup');
  });
});

describe('info tindak lanjut WhatsApp di halaman detail', () => {
  it('muncul di kepala (dekat tombol ajukan) dan di panel penutup, tanpa janji jam/waktu', () => {
    const html = render(<LayananDetailBody data={data} onAjukan={() => {}} />);
    expect(count(html, T.waInfo)).toBe(2);
    expect(T.waInfo).not.toMatch(/\d/);
  });
});
