// @vitest-environment node
// Admin Laporan Penduduk Bulanan: menu di domain Kependudukan, markup form (total L+P read-only, bulan bernama),
// tabel (periode, total per baris, aksi), halaman list/create/edit, dan perilaku state (validasi sebelum API).
// jsdom rusak di repo ini → SSR via renderToStaticMarkup; klik tidak teruji.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, post, route } = vi.hoisted(() => ({
  toast: { error: vi.fn(), success: vi.fn() },
  post: vi.fn(),
  route: { id: 'lap1' },
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: route.id }),
  usePathname: () => '/admin/kependudukan/laporan-bulanan',
}));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { kependudukan: { laporanbulanan: { create: { post } } } } },
}));

import { kependudukanMenu } from '@/app/admin/_com/nav/domains';
import laporanBulanan, { defaultLaporanForm, type LaporanBulananItem } from '@/app/admin/(dashboard)/_state/kependudukan/laporan-bulanan';
import LaporanBulananAdmin from '@/app/admin/(dashboard)/kependudukan/laporan-bulanan/page';
import CreateLaporanBulanan from '@/app/admin/(dashboard)/kependudukan/laporan-bulanan/create/page';
import EditLaporanBulanan from '@/app/admin/(dashboard)/kependudukan/laporan-bulanan/[id]/edit/page';
import LaporanBulananForm from '@/app/admin/(dashboard)/kependudukan/laporan-bulanan/_com/LaporanBulananForm';
import LaporanBulananTable from '@/app/admin/(dashboard)/kependudukan/laporan-bulanan/_com/LaporanBulananTable';
import {
  BULAN_LABEL,
  bulanLabel,
  totalPenduduk,
} from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: isian rekaan
const form = { banjar: 'Banjar Contoh', tahun: 2026, bulan: 3, lakiLaki: 120, perempuan: 130 };
const row = (id: string, over: Partial<LaporanBulananItem> = {}): LaporanBulananItem => ({ id, ...form, ...over });

beforeEach(() => {
  vi.clearAllMocks();
  laporanBulanan.create.form = defaultLaporanForm();
  laporanBulanan.findMany.data = [];
  laporanBulanan.edit.id = '';
});

describe('navigasi', () => {
  it('Laporan Bulanan ada di domain Kependudukan dengan path & basePath sendiri', () => {
    const item = kependudukanMenu.children?.find((c) => c.id === 'kependudukan.laporan-bulanan');
    expect(item).toEqual({
      id: 'kependudukan.laporan-bulanan',
      name: 'Laporan Bulanan',
      path: '/admin/kependudukan/laporan-bulanan',
      basePath: '/admin/kependudukan/laporan-bulanan',
    });
    expect(kependudukanMenu.children?.some((c) => c.id === 'kependudukan.data-banjar')).toBe(true);
  });
});

describe('aturan tampilan', () => {
  it('12 nama bulan Indonesia; total = L + P', () => {
    expect(BULAN_LABEL).toHaveLength(12);
    expect([bulanLabel(1), bulanLabel(8), bulanLabel(12)]).toEqual(['Januari', 'Agustus', 'Desember']);
    expect(totalPenduduk({ lakiLaki: 120, perempuan: 130 })).toBe(250);
  });

  it('form awal memakai periode berjalan', () => {
    expect(defaultLaporanForm(new Date(2026, 2, 15))).toEqual({ banjar: '', tahun: 2026, bulan: 3, lakiLaki: 0, perempuan: 0 });
  });
});

describe('LaporanBulananForm', () => {
  const html = render(
    <LaporanBulananForm form={{ ...form }} loading={false} submitLabel="Simpan" banjarOptions={['Banjar Contoh']} onSubmit={() => undefined} />,
  );

  it('menampilkan semua field, bulan dengan nama Indonesia, dan banjar terisi', () => {
    for (const label of ['Banjar', 'Tahun', 'Bulan', 'Laki-laki', 'Perempuan']) expect(html).toContain(label);
    expect(html).toContain('value="Maret"');
    expect(html).toContain('value="Banjar Contoh"');
    expect(html).toContain('Simpan');
  });

  it('total L+P tampil read-only dan terformat', () => {
    expect(html).toContain('Total (Laki-laki + Perempuan)');
    expect(html).toMatch(/<input[^>]*readOnly=""[^>]*value="250"/);
  });

  it('total mengikuti angka form', () => {
    const big = render(
      <LaporanBulananForm form={{ ...form, lakiLaki: 1500, perempuan: 1600 }} loading={false} submitLabel="Simpan" banjarOptions={[]} onSubmit={() => undefined} />,
    );
    expect(big).toContain('value="3.100"');
  });
});

describe('LaporanBulananTable', () => {
  const props = { deleting: false, onEdit: () => undefined, onDelete: () => undefined };

  it('merender periode bernama, L, P, total per baris, dan aksi edit/hapus', () => {
    const html = render(<LaporanBulananTable {...props} loading={false} rows={[row('a'), row('b', { banjar: 'Banjar Lain', bulan: 12, lakiLaki: 1000, perempuan: 2000 })]} />);
    expect(html).toContain('Banjar Contoh');
    expect(html).toContain('Maret 2026');
    expect(html).toContain('>250<');
    expect(html).toContain('Desember 2026');
    expect(html).toContain('>3.000<');
    expect(html).toContain('aria-label="Edit laporan Banjar Contoh"');
    expect(html).toContain('aria-label="Hapus laporan Banjar Lain"');
  });

  it('kosong → pesan, tanpa tabel; memuat → kerangka tanpa pesan kosong', () => {
    const kosong = render(<LaporanBulananTable {...props} loading={false} rows={[]} />);
    expect(kosong).toContain('Belum ada laporan bulanan yang cocok');
    expect(kosong).not.toContain('<table');
    const memuat = render(<LaporanBulananTable {...props} loading rows={[row('a')]} />);
    expect(memuat).not.toContain('Maret 2026');
    expect(memuat).not.toContain('Belum ada laporan');
  });
});

describe('halaman admin', () => {
  it('list: judul, filter, tombol tambah, dan empty state', () => {
    const html = render(<LaporanBulananAdmin />);
    expect(html).toContain('Laporan Bulanan');
    expect(html).toContain('Tambah Baru');
    expect(html).toContain('Semua Bulan');
    expect(html).toContain('Cari nama banjar');
    expect(html).toContain('Belum ada laporan bulanan yang cocok');
  });

  it('list: baris dari state dirender dengan total', () => {
    laporanBulanan.findMany.data = [row('a')];
    expect(render(<LaporanBulananAdmin />)).toContain('Maret 2026');
  });

  it('create: form kosong dengan tombol Simpan', () => {
    const html = render(<CreateLaporanBulanan />);
    expect(html).toContain('Tambah Laporan Bulanan');
    expect(html).toContain('Laki-laki');
    expect(html).toContain('>Simpan<');
  });

  it('edit: kerangka sebelum data id ini termuat, form setelahnya', () => {
    const memuat = render(<EditLaporanBulanan />);
    expect(memuat).toContain('Edit Laporan Bulanan');
    expect(memuat).not.toContain('Simpan Perubahan');
    laporanBulanan.edit.id = 'lap1';
    laporanBulanan.edit.form = { ...form };
    const siap = render(<EditLaporanBulanan />);
    expect(siap).toContain('Simpan Perubahan');
    expect(siap).toContain('value="Banjar Contoh"');
  });
});

describe('state create.submit', () => {
  it('menolak bulan tidak valid dengan toast, tanpa memanggil API', async () => {
    laporanBulanan.create.form = { ...form, bulan: 13 };
    expect(await laporanBulanan.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Bulan'));
    expect(post).not.toHaveBeenCalled();
  });

  it('mengirim isian ternormalisasi dan berhasil', async () => {
    post.mockResolvedValue({ status: 200, data: { success: true }, error: null });
    laporanBulanan.create.form = { ...form, banjar: '  Banjar   Contoh ' };
    expect(await laporanBulanan.create.submit()).toBe(true);
    expect(post).toHaveBeenCalledWith(form);
    expect(toast.success).toHaveBeenCalled();
  });

  it('menampilkan pesan duplikat dari API (409) dan mengembalikan false', async () => {
    post.mockResolvedValue({ status: 409, data: null, error: { value: { success: false, message: 'Laporan untuk banjar ini sudah ada' } } });
    laporanBulanan.create.form = { ...form };
    expect(await laporanBulanan.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Laporan untuk banjar ini sudah ada');
  });
});
