// @vitest-environment node
// Panel Sampah per fitur (SSR): empty state menyebut retensi, item merender judul/folder/sisa hari + aksi,
// judul "Sampah (n)", serta panel terpasang di detail APBDes, Galeri BUMDes, dan list Dokumen Perencanaan.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ap1' }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin',
}));

import { SampahPanel, SampahPanelView, type SampahPanelViewData } from '@/app/admin/(dashboard)/_com/sampah/SampahPanel';
import { SampahPanelList } from '@/app/admin/(dashboard)/_com/sampah/SampahPanelList';
import type { SampahPanelItem } from '@/app/admin/(dashboard)/_com/sampah/sampah-panel.logic';
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import DetailAPBDes from '@/app/admin/(dashboard)/landing-page/apbdes/[id]/page';
import GaleriFotoBumdesAdmin from '@/app/admin/(dashboard)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_lib/GaleriFotoBumdesAdmin';
import DokumenPerencanaanAdmin from '@/app/admin/(dashboard)/pemerintahan/kegiatan-desa/dokumen-perencanaan/page';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const item = (id: string, over: Partial<SampahPanelItem> = {}): SampahPanelItem => ({
  id,
  judul: `Perdes ${id}`,
  mimeType: 'application/pdf',
  kategori: 'document',
  ukuran: 2048,
  pratinjauUrl: `/api/fileStorage/findUnique/${id}`,
  dihapusPada: '2026-11-10T00:00:00.000Z',
  sisaHari: 20,
  folderNama: 'Semester I',
  ...over,
}); // test-only

const data = (over: Partial<SampahPanelViewData> = {}): SampahPanelViewData => ({
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  retensiHari: 30,
  loaded: true,
  loading: false,
  error: null,
  busy: null,
  hapusTarget: null,
  ...over,
}); // test-only

const noop = () => undefined;
const handlers = { onPage: noop, onRetry: noop, onPulihkan: noop, onPilihHapus: noop, onKonfirmasiHapus: noop };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SampahPanelList', () => {
  it('kosong → empty state menyebut angka retensi', () => {
    const html = render(<SampahPanelList items={[]} retensiHari={30} busy={null} onPulihkan={noop} onHapus={noop} />);
    expect(html).toContain('data-testid="sampah-panel-kosong"');
    expect(html).toContain('Sampah kosong. Item yang dihapus disimpan di sini selama 30 hari.');
  });

  it('item merender judul, folder asal, ukuran, tanggal, badge sisa hari, dan tombol aksi', () => {
    const html = render(
      <SampahPanelList
        items={[item('d1'), item('d2', { sisaHari: 3, folderNama: null })]}
        retensiHari={30}
        busy={null}
        onPulihkan={noop}
        onHapus={noop}
      />,
    );
    expect([...html.matchAll(/data-sampah-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['d1', 'd2']);
    expect(html).toContain('Perdes d1');
    expect(html).toContain('Folder Semester I · 2 KB · Dihapus 10 Nov 2026');
    expect(html).toContain('Sisa 20 hari');
    expect(html).toContain('Sisa 3 hari');
    expect(html).toContain('aria-label="Pulihkan Perdes d1"');
    expect(html).toContain('aria-label="Hapus permanen Perdes d2"');
    expect(html).not.toContain('sampah-panel-kosong');
  });

  it('foto → thumbnail gambar dari pratinjauUrl', () => {
    const foto = item('f1', { kategori: 'image', mimeType: 'image/png', pratinjauUrl: '/api/fileStorage/findUnique/f1' });
    const html = render(<SampahPanelList items={[foto]} retensiHari={30} busy={null} onPulihkan={noop} onHapus={noop} />);
    expect(html).toMatch(/<img[^>]+src="\/api\/fileStorage\/findUnique\/f1"/);
  });

  it('aksi berjalan → tombol item itu nonaktif', () => {
    const html = render(
      <SampahPanelList items={[item('d1')]} retensiHari={30} busy={{ id: 'd1', aksi: 'hapus' }} onPulihkan={noop} onHapus={noop} />,
    );
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Pulihkan Perdes d1"|aria-label="Pulihkan Perdes d1"[^>]*disabled/);
  });
});

describe('SampahPanelView', () => {
  it('judul "Sampah (n)" setelah dimuat + atribut sumber', () => {
    const html = render(<SampahPanelView sumber="dokumen-apbdes" data={data({ items: [item('d1')], total: 1 })} {...handlers} />);
    expect(html).toContain('data-testid="sampah-panel"');
    expect(html).toContain('data-sumber="dokumen-apbdes"');
    expect(html).toContain('Sampah (1)');
  });

  it('dibuka + kosong → empty state dengan retensi dari API', () => {
    const html = render(<SampahPanelView sumber="foto-bumdes" data={data({ retensiHari: 14 })} defaultOpened {...handlers} />);
    expect(html).toContain('selama 14 hari');
  });

  it('error → pesan + tombol coba lagi', () => {
    const html = render(<SampahPanelView sumber="foto-bumdes" data={data({ error: 'Gagal memuat Sampah' })} defaultOpened {...handlers} />);
    expect(html).toContain('Gagal memuat Sampah');
    expect(html).toContain('Coba lagi');
  });

  it('pagination hanya tampil bila total > limit', () => {
    const banyak = render(<SampahPanelView sumber="foto-bumdes" data={data({ items: [item('d1')], total: 45 })} defaultOpened {...handlers} />);
    const sedikit = render(<SampahPanelView sumber="foto-bumdes" data={data({ items: [item('d1')], total: 20 })} defaultOpened {...handlers} />);
    expect(banyak).toContain('mantine-Pagination-root');
    expect(sedikit).not.toContain('mantine-Pagination-root');
  });

  it('belum dimuat → judul tanpa jumlah', () => {
    const html = render(<SampahPanel sumber="dokumen-perencanaan" />);
    expect(html).toContain('data-sumber="dokumen-perencanaan"');
    expect(html).not.toMatch(/Sampah \(\d+\)/);
  });
});

describe('panel terpasang di fitur', () => {
  it('detail APBDes: panel dokumen-apbdes', () => {
    apbdes.findUnique.data = {
      id: 'ap1',
      name: 'APBDes 2026',
      tahun: 2026,
      items: [],
      folders: [],
      dokumenUmum: [],
    } as unknown as typeof apbdes.findUnique.data;
    vi.spyOn(apbdes.findUnique, 'load').mockResolvedValue(undefined as never);
    const html = render(<DetailAPBDes />);
    expect(html).toContain('data-sumber="dokumen-apbdes"');
    apbdes.findUnique.data = null;
  });

  it('Galeri BUMDes: panel foto-bumdes hanya bila profil sudah tersimpan', () => {
    expect(render(<GaleriFotoBumdesAdmin profilTersimpan />)).toContain('data-sumber="foto-bumdes"');
    expect(render(<GaleriFotoBumdesAdmin profilTersimpan={false} />)).not.toContain('data-testid="sampah-panel"');
  });

  it('list Dokumen Perencanaan: panel dokumen-perencanaan', () => {
    expect(render(<DokumenPerencanaanAdmin />)).toContain('data-sumber="dokumen-perencanaan"');
  });
});
