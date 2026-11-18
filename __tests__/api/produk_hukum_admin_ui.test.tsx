// @vitest-environment node
// Produk Hukum (Pemerintahan): UI admin (SSR) — form (nilai terkontrol, batas panjang, tautan PDF saat ini), tabel
// (tautan buka PDF hanya bila ada berkas, aksi berlabel judul), dan daftar (keadaan memuat/kosong/isi + paginasi).
// Klik/unggah tidak teruji (jsdom rusak); yang diuji markup untuk tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 'ph-1' }),
}));

import ProdukHukumForm from '@/app/admin/(dashboard)/pemerintahan/produk-hukum/_com/ProdukHukumForm';
import { ProdukHukumList, emptyMessage } from '@/app/admin/(dashboard)/pemerintahan/produk-hukum/_com/ProdukHukumList';
import { ProdukHukumTable } from '@/app/admin/(dashboard)/pemerintahan/produk-hukum/_com/ProdukHukumTable';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from '@/app/admin/(dashboard)/pemerintahan/produk-hukum/_com/produk-hukum.text';
import state, { type ProdukHukumItem } from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import { JUDUL_PRODUK_HUKUM_MAX, NOMOR_PRODUK_HUKUM_MAX } from '@/lib/produk-hukum';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: baris dan berkas rekaan.
const FILE = { id: 'f-1', link: '/api/fileStorage/findUnique/a.pdf', realName: 'a.pdf' };
const WITH_FILE: ProdukHukumItem = { id: 'a', judul: 'Perdes Uji 9', nomor: 'Nomor 9 Tahun 2021', tahun: 2021, kategori: 'PERDES', file: FILE };
const NO_FILE: ProdukHukumItem = { id: 'b', judul: 'SK Uji', nomor: null, tahun: null, kategori: 'SK_PERBEKEL', file: null };
/** Tag tombol/tautan aksi menurut aria-label. */
const action = (html: string, label: string) => html.match(new RegExp(`<(?:a|button)[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';

beforeEach(() => {
  state.findMany.data = [];
  state.findMany.page = 1;
  state.findMany.totalPages = 1;
  state.findMany.loading = false;
  state.delete.loading = false;
  state.create.reset();
});

describe('ProdukHukumForm', () => {
  const form = (props: Partial<React.ComponentProps<typeof ProdukHukumForm>> = {}) =>
    render(
      <ProdukHukumForm form={state.create.form} loading={false} submitLabel={T.submitCreate} onSubmit={() => {}} {...props} />,
    );

  it('field: kategori (label), judul, nomor, tahun, PDF opsional dan tombol simpan', () => {
    const html = form();
    for (const label of [T.formKategori, T.formJudul, T.formNomor, T.formTahun, T.formPdf]) expect(html).toContain(label);
    expect(html).toContain('value="Peraturan Desa (Perdes)"');
    expect(html).toContain(`maxLength="${JUDUL_PRODUK_HUKUM_MAX}"`);
    expect(html).toContain(`maxLength="${NOMOR_PRODUK_HUKUM_MAX}"`);
    expect(html).toContain('Opsional, maksimal 20 MB');
    expect(html).toContain(T.submitCreate);
  });

  it('nilai terkontrol dari proxy form: judul, nomor, tahun, dan kategori terpilih', () => {
    Object.assign(state.create.form, { judul: 'Perdes APBDes', nomor: 'Nomor 9', tahun: 2021, kategori: 'SK_PERBEKEL' });
    const html = form();
    expect(html).toContain('value="Perdes APBDes"');
    expect(html).toContain('value="Nomor 9"');
    expect(html).toContain('value="2021"');
    expect(html).toContain('value="SK Perbekel"');
  });

  it('mode edit: tautan PDF saat ini tampil; tanpa berkas tidak ada tautan', () => {
    const edit = form({ currentFile: FILE, submitLabel: T.submitEdit });
    expect(edit).toContain(`href="${FILE.link}"`);
    expect(edit).toContain('a.pdf');
    expect(edit).toContain(T.submitEdit);
    expect(form()).not.toContain('Berkas saat ini');
  });
});

describe('ProdukHukumTable', () => {
  const table = (items: ProdukHukumItem[]) => render(<ProdukHukumTable items={items} onEdit={() => {}} onDelete={() => {}} />);

  it('baris: judul, nomor, label kategori, tahun; tahun kosong "-"', () => {
    const html = table([WITH_FILE, NO_FILE]);
    expect(html).toContain('Perdes Uji 9');
    expect(html).toContain('Nomor 9 Tahun 2021');
    expect(html).toContain('Peraturan Desa (Perdes)');
    expect(html).toContain('SK Perbekel');
    expect(html).toContain('>2021<');
    expect(html).toContain('>-<');
  });

  it('tautan buka PDF hanya untuk entri berkas (tab baru); entri tanpa berkas diberi penanda', () => {
    const html = table([WITH_FILE, NO_FILE]);
    const buka = action(html, T.openPdf(WITH_FILE.judul));
    expect(buka).toContain(`href="${FILE.link}"`);
    expect(buka).toContain('target="_blank"');
    expect(action(html, T.openPdf(NO_FILE.judul))).toBe('');
    expect(html.match(new RegExp(T.noFile, 'g'))).toHaveLength(1);
  });

  it('edit dan hapus selalu ada per baris, berlabel judul', () => {
    const html = table([WITH_FILE, NO_FILE]);
    for (const item of [WITH_FILE, NO_FILE]) {
      expect(action(html, T.editLabel(item.judul))).not.toBe('');
      expect(action(html, T.deleteLabel(item.judul))).not.toBe('');
    }
  });
});

describe('ProdukHukumList', () => {
  const list = (search = '') => render(<ProdukHukumList search={search} />);

  it('memuat: kerangka, tanpa tabel dan tanpa pesan kosong', () => {
    state.findMany.loading = true;
    const html = list();
    expect(html).not.toContain('<table');
    expect(html).not.toContain(T.empty);
  });

  it('kosong: pesan tanpa filter; tombol Tambah Baru dan filter kategori tetap ada', () => {
    const html = list();
    expect(html).toContain(T.empty);
    expect(html).toContain(T.addNew);
    for (const label of [T.filterAll, 'Peraturan Desa (Perdes)', 'Peraturan Perbekel', 'SK Perbekel', 'Lainnya']) {
      expect(html).toContain(label);
    }
  });

  it('isi: tabel dengan baris; paginasi hanya bila > 1 halaman', () => {
    state.findMany.data = [WITH_FILE, NO_FILE];
    const satu = list();
    expect(satu).toContain('<table');
    expect(satu).toContain('Perdes Uji 9');
    expect(satu).not.toContain('mantine-Pagination-root');

    state.findMany.totalPages = 3;
    expect(list()).toContain('mantine-Pagination-root');
  });

  it('dialog hapus tertutup saat belum ada entri dipilih', () => {
    state.findMany.data = [WITH_FILE];
    expect(list()).not.toContain(T.confirmDelete);
  });

  it('emptyMessage: kata kunci > kategori > tanpa filter', () => {
    expect(emptyMessage('abc', 'PERDES')).toBe(T.emptySearch);
    expect(emptyMessage('', 'PERDES')).toBe(T.emptyKategori);
    expect(emptyMessage('', '')).toBe(T.empty);
  });
});
