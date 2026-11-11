// @vitest-environment node
// Detail layanan surat keterangan: tanpa foto utama, persyaratan + gambar alur, tombol ajukan di atas & penutup,
// formulir permohonan di modal. jsdom rusak di repo ini → markup via renderToStaticMarkup (efek tidak jalan).
import { MantineProvider, Modal } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { AjukanPermohonanModal } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/detail/AjukanPermohonanModal';
import { LayananDetail, LayananDetailBody } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/detail/LayananDetail';
import { LAYANAN_DETAIL_TEXT as T } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/detail/layanan-detail.text';
import type { LayananDetailData } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/detail/use-layanan-detail';

// Modal di portal tidak dirender di server; matikan portal agar isi formulir bisa diperiksa.
// `<Modal>` (bukan Modal.Root) membawa defaultProps sendiri (withinPortal: true) → extend Modal, bukan ModalRoot.
const theme = { components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: respons pelayanansuratketerangan/{id}.
const data: LayananDetailData = {
  id: 's1',
  name: 'Surat Keterangan Kelakuan Baik',
  deskripsi: '<p>Persyaratan Dokumen :</p><ul><li><p>Fotocopy KTP</p></li></ul>',
  image: { link: 'https://example.test/foto.jpg' },
  image2: { link: 'https://example.test/alur.png' },
  estimasiWaktu: '1 hari kerja',
  biaya: 0,
};

describe('LayananDetailBody', () => {
  it('kategori (tautan ke daftar), h1 nama, badge, persyaratan, gambar alur; tanpa foto utama', () => {
    const html = render(<LayananDetailBody data={data} onAjukan={() => {}} />);
    expect(html).toContain(`href="/darmasaba/pemerintahan/layanan"`);
    expect(html).toContain(T.kategori);
    expect(html).toMatch(/<h1[^>]*>Surat Keterangan Kelakuan Baik<\/h1>/);
    expect(html).toContain('1 hari kerja • Gratis');
    expect(html).toContain('<li><p>Fotocopy KTP</p></li>');
    expect(html).toContain('src="https://example.test/alur.png"');
    expect(html).toContain(`alt="${T.alurAlt(data.name)}"`);
    expect(html).not.toContain('https://example.test/foto.jpg');
  });

  it('tombol ajukan di kepala dan di panel penutup', () => {
    const html = render(<LayananDetailBody data={data} onAjukan={() => {}} />);
    expect(count(html, `aria-haspopup="dialog">${T.ajukan}</button>`)).toBe(2);
    expect(html).toContain(T.closingTitle);
  });

  it('tanpa gambar alur → figure tidak dirender', () => {
    const html = render(<LayananDetailBody data={{ ...data, image2: null }} onAjukan={() => {}} />);
    expect(html).not.toContain('<figure');
  });
});

describe('LayananDetail', () => {
  it('render awal = kerangka memuat (aria-busy) + tombol kembali, bukan pesan tidak ditemukan', () => {
    const html = render(<LayananDetail id="s1" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(T.loading);
    expect(html).not.toContain(T.notFound);
  });
});

describe('AjukanPermohonanModal', () => {
  it('judul modal + 5 isian + Simpan nonaktif selama formulir kosong', () => {
    const html = render(<AjukanPermohonanModal opened onClose={() => {}} />);
    expect(html).toContain(T.ajukan);
    for (const label of ['Nama', 'NIK', 'Alamat', 'Nomor KK', 'Kategori']) expect(html).toContain(label);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*Simpan/);
    // Bingkai Paper lama di dalam isi modal sudah dibuang (Modal.Content sendiri memang Paper).
    expect(html.split('mantine-Modal-body')[1]).not.toContain('mantine-Paper-root');
  });
});
