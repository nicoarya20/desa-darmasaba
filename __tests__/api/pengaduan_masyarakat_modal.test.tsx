// @vitest-environment node
// Modal form pengaduan masyarakat (komponen reusable, dipakai hub layanan online
// desa, footer & beranda) + ubin Pengaduan di hub membuka komponen yang sama.
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

const { findManyGet } = vi.hoisted(() => ({ findManyGet: vi.fn(async () => ({ status: 200, data: null })) }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      inovasi: {
        layananonlinedesa: {
          pengaduanmasyarakat: { jenispengaduan: { 'find-many': { get: findManyGet } } },
        },
      },
    },
  },
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// Editor tiptap berat & tidak relevan untuk cek struktur form.
vi.mock('@/app/admin/(dashboard)/_com/createEditor', () => ({
  default: () => <textarea data-testid="editor-deskripsi" />,
}));

import PengaduanMasyarakatModal from '@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal';

// env="test" mematikan portal & transisi Mantine → isi Modal ikut ter-render di SSR.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const FIELD_LABELS = ['Nama', 'Email', 'Nomor Telepon', 'NIK', 'Judul Pengaduan', 'Lokasi Kejadian', 'Jenis Pengaduan'];

describe('PengaduanMasyarakatModal', () => {
  it('opened → merender judul & semua field form pengaduan', () => {
    const html = render(<PengaduanMasyarakatModal opened onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('Ajukan Pengaduan Masyarakat');
    FIELD_LABELS.forEach((label) => expect(html).toMatch(new RegExp(`<label[^>]*>(<[^>]+>)*${label}<`)));
    expect(html).toContain('data-testid="editor-deskripsi"');
    expect(html).toContain('Gambar');
  });

  it('form kosong → tombol Simpan nonaktif', () => {
    const html = render(<PengaduanMasyarakatModal opened onClose={() => {}} />);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>(<[^>]+>)*Simpan</);
  });

  it('opened=false → isi form tidak dirender', () => {
    const html = render(<PengaduanMasyarakatModal opened={false} onClose={() => {}} />);
    expect(html).not.toContain('Ajukan Pengaduan Masyarakat');
  });
});

describe('hub layanan online desa — ubin Pengaduan Masyarakat', () => {
  // Hub dirender utuh dengan modal tiruan: hanya cek ubin + status opened yang diteruskan ke modal bersama.
  const renderHub = async (query: string) => {
    vi.resetModules();
    vi.doMock('@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal', () => ({
      default: ({ opened }: { opened: boolean }) => <div data-testid="pengaduan-modal" data-opened={String(opened)} />,
    }));
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ replace: vi.fn() }),
      useSearchParams: () => new URLSearchParams(query),
    }));
    vi.doMock('next-view-transitions', () => ({
      Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
      useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
    }));
    try {
      const { LayananOnlinePage } = await import(
        '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/LayananOnlinePage'
      );
      return render(<LayananOnlinePage />);
    } finally {
      vi.doUnmock('@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal');
      vi.doUnmock('next/navigation');
      vi.doUnmock('next-view-transitions');
    }
  };

  it('memakai PengaduanMasyarakatModal yang sama, tertutup sampai ubin diklik', async () => {
    const html = await renderHub('');
    expect(html).toContain('>Pengaduan Masyarakat</h2>');
    expect(html).toContain('Sampaikan keluhan dan aspirasi Anda');
    expect(html).toMatch(/<button type="button"[^>]*>Sampaikan pengaduan/);
    expect(html).toContain('data-testid="pengaduan-modal" data-opened="false"');
  });

  it('?layanan=pengaduan (tujuan alih route lama) → modal terbuka saat dimuat', async () => {
    const html = await renderHub('layanan=pengaduan');
    expect(html).toContain('data-testid="pengaduan-modal" data-opened="true"');
  });
});
