// @vitest-environment node
// Indeks Desa (IDM): UI admin (SSR) — form (field, nilai terkontrol dari proxy, 5 status), tabel (aksi berlabel tahun), dan
// daftar (keadaan memuat/kosong/isi + paginasi). Klik tidak teruji (jsdom rusak); yang diuji markup tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 'idm-1' }),
}));

import IndeksDesaForm from '@/app/admin/(dashboard)/indeks-desa/idm/_com/IndeksDesaForm';
import { IndeksDesaList } from '@/app/admin/(dashboard)/indeks-desa/idm/_com/IndeksDesaList';
import { IndeksDesaTable } from '@/app/admin/(dashboard)/indeks-desa/idm/_com/IndeksDesaTable';
import { INDEKS_DESA_ADMIN_TEXT as T } from '@/app/admin/(dashboard)/indeks-desa/idm/_com/indeks-desa.text';
import state, { type IndeksDesaItem } from '@/app/admin/(dashboard)/_state/indeks-desa/indeksDesa';
import { CATATAN_IDM_MAX } from '@/lib/indeks-desa';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: baris rekaan untuk menguji markup, bukan data IDM Desa Darmasaba.
const ROW_A: IndeksDesaItem = { id: 'a', tahun: 2031, skorIdm: 0.55, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.7, status: 'Maju', catatan: null };
const ROW_B: IndeksDesaItem = { id: 'b', tahun: 2030, skorIdm: 0.45, skorIks: 0.3, skorIke: 0.5, skorIkl: 0.6, status: 'Berkembang', catatan: 'Uji' };
/** Tag tombol aksi menurut aria-label. */
const action = (html: string, label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';

beforeEach(() => {
  state.findMany.data = [];
  state.findMany.page = 1;
  state.findMany.totalPages = 1;
  state.findMany.loading = false;
  state.delete.loading = false;
  state.create.reset();
});

describe('IndeksDesaForm', () => {
  const form = () =>
    render(<IndeksDesaForm form={state.create.form} loading={false} submitLabel={T.submitCreate} onSubmit={() => {}} />);

  it('field: tahun, empat skor (IDM, IKS, IKE, IKL), status, catatan, dan tombol simpan', () => {
    const html = form();
    for (const label of [T.formTahun, 'Skor IDM', 'Skor IKS', 'Skor IKE', 'Skor IKL', T.formStatus, T.formCatatan]) {
      expect(html).toContain(label);
    }
    expect(html).toContain('Indeks Ketahanan Sosial');
    expect(html).toContain('Indeks Ketahanan Ekonomi');
    expect(html).toContain('Indeks Ketahanan Lingkungan');
    expect(html).toContain(`maxLength="${CATATAN_IDM_MAX}"`);
    expect(html).toContain(T.submitCreate);
  });

  it('petunjuk: status tidak dihitung otomatis dari skor', () => {
    expect(form()).toContain('Status tidak dihitung otomatis dari skor');
  });

  it('nilai terkontrol dari proxy form: tahun, skor teks, status, catatan', () => {
    Object.assign(state.create.form, {
      tahun: 2030,
      skorIdm: '0,5',
      skorIks: '0.4',
      status: 'Mandiri',
      catatan: 'Sumber uji',
    });
    const html = form();
    expect(html).toContain('value="2030"');
    expect(html).toContain('value="0,5"');
    expect(html).toContain('value="0.4"');
    expect(html).toContain('value="Mandiri"');
    expect(html).toContain('Sumber uji');
  });
});

describe('IndeksDesaTable', () => {
  const table = (items: IndeksDesaItem[]) => render(<IndeksDesaTable items={items} onEdit={() => {}} onDelete={() => {}} />);

  it('baris: tahun, skor IDM, dan status', () => {
    const html = table([ROW_A, ROW_B]);
    expect(html).toContain('>2031<');
    expect(html).toContain('>0.55<');
    expect(html).toContain('Maju');
    expect(html).toContain('Berkembang');
  });

  it('edit dan hapus ada per baris, berlabel tahun', () => {
    const html = table([ROW_A, ROW_B]);
    for (const item of [ROW_A, ROW_B]) {
      expect(action(html, T.editLabel(item.tahun))).not.toBe('');
      expect(action(html, T.deleteLabel(item.tahun))).not.toBe('');
    }
  });
});

describe('IndeksDesaList', () => {
  const list = () => render(<IndeksDesaList />);

  it('memuat: kerangka, tanpa tabel dan tanpa pesan kosong', () => {
    state.findMany.loading = true;
    const html = list();
    expect(html).not.toContain('<table');
    expect(html).not.toContain(T.empty);
  });

  it('kosong: pesan kosong dan tombol Tambah Baru tetap ada', () => {
    const html = list();
    expect(html).toContain(T.empty);
    expect(html).toContain(T.addNew);
    expect(html).not.toContain('<table');
  });

  it('isi: tabel dengan baris; paginasi hanya bila > 1 halaman', () => {
    state.findMany.data = [ROW_A, ROW_B];
    const satu = list();
    expect(satu).toContain('<table');
    expect(satu).not.toContain('mantine-Pagination-root');

    state.findMany.totalPages = 3;
    expect(list()).toContain('mantine-Pagination-root');
  });

  it('dialog hapus tertutup saat belum ada baris dipilih', () => {
    state.findMany.data = [ROW_A];
    expect(list()).not.toContain(T.confirmDelete);
  });
});
