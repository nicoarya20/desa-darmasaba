// @vitest-environment node
// Admin Arah Kebijakan Pembangunan Desa: judul halaman baru, dropdown & filter memuat lima jenis,
// dan field form (periode / tahun / musyawarah) tampil sesuai jenis. jsdom rusak → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/pemerintahan/dokumen-perencanaan',
  useParams: () => ({}),
}));

import stateDokumenPerencanaan, {
  type DokumenPerencanaanForm as FormValues,
  type DokumenPerencanaanItem,
} from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import DokumenPerencanaanForm from '@/app/admin/(dashboard)/pemerintahan/dokumen-perencanaan/_com/DokumenPerencanaanForm';
import {
  DOKUMEN_ADMIN_TEXT,
  JENIS_OPTIONS,
  MUSYAWARAH_OPTIONS,
} from '@/app/admin/(dashboard)/pemerintahan/dokumen-perencanaan/_com/dokumen-perencanaan.text';
import DokumenPerencanaanAdmin from '@/app/admin/(dashboard)/pemerintahan/dokumen-perencanaan/page';
import { JENIS_DOKUMEN, JENIS_DOKUMEN_LABEL } from '@/lib/dokumen-perencanaan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const formValues = (extra: Partial<FormValues>): FormValues => ({
  jenis: 'RPJM', judul: '', tahun: null, tahunMulai: null, tahunSelesai: null, // test-only
  nomorPerdes: '', ringkasan: '', jenisMusyawarah: null, fileId: undefined, ...extra,
});
const renderForm = (extra: Partial<FormValues>, title?: string) =>
  render(<DokumenPerencanaanForm form={formValues(extra)} loading={false} submitLabel="Simpan" title={title} onSubmit={() => undefined} />);

const item = (jenis: string, extra: Partial<DokumenPerencanaanItem> = {}): DokumenPerencanaanItem => ({
  id: `d-${jenis}`, jenis, judul: `Dokumen ${jenis}`, tahun: 2026, tahunMulai: null, tahunSelesai: null, // test-only
  nomorPerdes: null, ringkasan: null, jenisMusyawarah: null, fileId: null, file: null, ...extra,
});

beforeEach(() => {
  Object.assign(stateDokumenPerencanaan.findMany, { data: [], page: 1, totalPages: 1, loading: false });
});

describe('opsi jenis', () => {
  it('dropdown memuat lima jenis lengkap dengan label baru', () => {
    expect(JENIS_OPTIONS).toHaveLength(5);
    expect(JENIS_OPTIONS.map((o) => o.value)).toEqual([...JENIS_DOKUMEN]);
    expect(JENIS_OPTIONS.find((o) => o.value === 'APBDES')?.label).toBe('APBDes');
    expect(JENIS_OPTIONS.find((o) => o.value === 'PELAPORAN_APBDES')?.label).toBe('Pelaporan Realisasi APBDes');
    expect(JENIS_OPTIONS.find((o) => o.value === 'BERITA_ACARA_MUSYAWARAH')?.label).toBe('Berita Acara Musyawarah');
  });

  it('opsi musyawarah tetap empat (data berita acara lama tetap bisa diedit)', () => {
    expect(MUSYAWARAH_OPTIONS.map((o) => o.value)).toEqual(['MUSDES', 'MUSRENBANGDES', 'MMD', 'LAINNYA']);
  });
});

describe('DokumenPerencanaanForm', () => {
  it('judul formulir bawaan dan judul khusus tambah/ubah memakai nama baru', () => {
    expect(text(renderForm({}))).toContain(DOKUMEN_ADMIN_TEXT.pageTitle);
    expect(text(renderForm({}, DOKUMEN_ADMIN_TEXT.createTitle))).toContain('Tambah Dokumen Arah Kebijakan Pembangunan Desa');
    expect(text(renderForm({}, DOKUMEN_ADMIN_TEXT.editTitle))).toContain('Ubah Dokumen Arah Kebijakan Pembangunan Desa');
    expect(text(renderForm({}))).not.toContain('Dokumen Perencanaan');
  });

  it('RPJM menampilkan periode, bukan tahun tunggal atau jenis musyawarah', () => {
    const t = text(renderForm({ jenis: 'RPJM' }));
    expect(t).toContain('Tahun Mulai');
    expect(t).toContain('Tahun Selesai');
    expect(t).not.toContain('Jenis Musyawarah');
  });

  it.each(['RKP', 'APBDES', 'PELAPORAN_APBDES'] as const)('%s menampilkan satu field Tahun saja', (jenis) => {
    const html = renderForm({ jenis, tahun: 2026 });
    const t = text(html);
    expect(t).toMatch(/Tahun\s*\*?\s/);
    expect(t).not.toContain('Tahun Mulai');
    expect(t).not.toContain('Jenis Musyawarah');
    expect(html).toContain(`value="${JENIS_DOKUMEN_LABEL[jenis]}"`);
  });

  it('jenis anggaran memberi petunjuk tahun anggaran; pelaporan memberi petunjuk periode di ringkasan', () => {
    expect(text(renderForm({ jenis: 'APBDES' }))).toContain('Tahun anggaran');
    expect(text(renderForm({ jenis: 'PELAPORAN_APBDES' }))).toContain('Tahun anggaran yang dilaporkan');
    expect(text(renderForm({ jenis: 'PELAPORAN_APBDES' }))).toContain('Semester I (Januari-Juni)');
    expect(text(renderForm({ jenis: 'RKP' }))).not.toContain('Semester I');
  });

  it('berita acara tetap menampilkan Jenis Musyawarah', () => {
    expect(text(renderForm({ jenis: 'BERITA_ACARA_MUSYAWARAH', tahun: 2026 }))).toContain('Jenis Musyawarah');
  });
});

describe('daftar admin', () => {
  it('judul halaman baru dan filter memuat Semua + lima jenis', () => {
    const t = text(render(<DokumenPerencanaanAdmin />));
    expect(t).toContain(DOKUMEN_ADMIN_TEXT.pageTitle);
    expect(t).toContain(DOKUMEN_ADMIN_TEXT.listTitle);
    expect(t).toContain(DOKUMEN_ADMIN_TEXT.filterAll);
    for (const jenis of JENIS_DOKUMEN) expect(t).toContain(JENIS_DOKUMEN_LABEL[jenis]);
    expect(t).not.toContain('Dokumen Perencanaan');
  });

  it('baris jenis baru memakai label dan tahun, bukan kode mentah', () => {
    stateDokumenPerencanaan.findMany.data = [item('PELAPORAN_APBDES'), item('APBDES')];
    const html = render(<DokumenPerencanaanAdmin />);
    const t = text(html);
    expect(t).toContain('Dokumen PELAPORAN_APBDES');
    expect(html).toContain('Pelaporan Realisasi APBDes</');
    expect(t).toContain('2026');
  });

  it('daftar kosong menyebut belum ada dokumen', () => {
    expect(text(render(<DokumenPerencanaanAdmin />))).toContain(DOKUMEN_ADMIN_TEXT.emptyAll);
  });
});
