// @vitest-environment node
// Dokumen Perencanaan jadi submenu Pemerintahan (juknis 2.2): item menu + tab lama hilang, redirect rute lama,
// Menu Access user lama terjaga lewat migrasi data, dan form memakai komponen PDF bersama. Tanpa DB/jsdom.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';

const pdfUpload = vi.hoisted(() => ({ uploadPdfFile: vi.fn() }));
vi.mock('@/app/admin/_com/upload/pdf-upload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/admin/_com/upload/pdf-upload')>()),
  uploadPdfFile: pdfUpload.uploadPdfFile,
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/pemerintahan/kegiatan-desa/list-kegiatan-desa',
  useParams: () => ({}),
}));

import { navBar, role1 } from '@/app/admin/_com/list_PageAdmin';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import { adminGuardRedirect } from '@/app/admin/_com/nav/menu-access.guard';
import { filterNavByMenuIds, isPathAllowed } from '@/app/admin/_com/nav/menu-access.logic';
import { uploadDokumenPdf, type DokumenPerencanaanForm as FormValues } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import DokumenPerencanaanForm from '@/app/admin/(dashboard)/pemerintahan/dokumen-perencanaan/_com/DokumenPerencanaanForm';
import LayoutTabsKegiatanDesa from '@/app/admin/(dashboard)/pemerintahan/kegiatan-desa/_com/layoutTabs';

const OLD_PATH = '/admin/pemerintahan/kegiatan-desa/dokumen-perencanaan';
const NEW_PATH = '/admin/pemerintahan/dokumen-perencanaan';
const OLD_ID = 'desa.kegiatan-desa';
const NEW_ID = 'desa.dokumen-perencanaan';
const ROLE_ADMIN_DESA = 2; // test-only

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('navigasi admin: Dokumen Perencanaan di Pemerintahan', () => {
  it('item menu sendiri di domain Pemerintahan dengan path & basePath baru', () => {
    const item = desaMenu.children?.find((c) => c.id === NEW_ID);
    expect(item).toEqual({ id: NEW_ID, name: 'Dokumen Perencanaan', path: NEW_PATH, basePath: NEW_PATH });
  });

  it('Kegiatan Desa tidak lagi mencakup path Dokumen Perencanaan (basePath tidak tumpang tindih)', () => {
    const kegiatan = desaMenu.children?.find((c) => c.id === OLD_ID);
    expect(kegiatan?.basePath).toBe('/admin/pemerintahan/kegiatan-desa');
    expect(isPathAllowed(NEW_PATH, filterNavByMenuIds(navBar, [OLD_ID]))).toBe(false);
  });

  it('tab Dokumen Perencanaan hilang dari layout tabs Kegiatan Desa; tab lain tetap', () => {
    const html = render(<LayoutTabsKegiatanDesa>isi</LayoutTabsKegiatanDesa>);
    expect(html).not.toContain('Dokumen Perencanaan');
    expect(html).not.toContain('dokumen-perencanaan');
    expect(html).toContain('List Kegiatan');
    expect(html).toContain('Kategori Kegiatan');
  });
});

describe('redirect rute lama Dokumen Perencanaan', () => {
  it.each([
    [OLD_PATH, NEW_PATH],
    [`${OLD_PATH}/create`, `${NEW_PATH}/create`],
    [`${OLD_PATH}/doc1/edit`, `${NEW_PATH}/doc1/edit`],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it('permanen, dan rute Kegiatan Desa lain tidak ikut dialihkan', async () => {
    const redirects = await loadRedirects();
    const rule = redirects.find((r) => r.source === `${OLD_PATH}/:path*`);
    expect(rule?.permanent).toBe(true);
    for (const path of [
      '/admin/pemerintahan/kegiatan-desa/list-kegiatan-desa',
      '/admin/pemerintahan/kegiatan-desa/kategori-kegiatan-desa',
      '/admin/pemerintahan/kegiatan-desa/dokumen-perencanaanx',
    ]) {
      expect(resolveRedirect(redirects, path), path).toBeNull();
    }
  });
});

describe('Menu Access user lama tetap bisa membuka Dokumen Perencanaan', () => {
  const sql = readFileSync(join(process.cwd(), 'prisma/migrations/20261118120000_lomba_laporan_penduduk_bulanan/migration.sql'), 'utf8');
  const dataMigration = sql.slice(sql.indexOf('INSERT INTO "UserMenuAccess"'));

  it('migrasi memberi ID baru kepada pemegang ID lama secara idempoten', () => {
    expect(dataMigration).toContain(`'${NEW_ID}'`);
    expect(dataMigration).toContain(`= '${OLD_ID}'`);
    expect(dataMigration).toContain('ON CONFLICT ("userId", "menuId") DO NOTHING');
    expect(dataMigration).toContain('NOT EXISTS');
    // Pemegang section 'Desa' sudah mencakup semua submenu → dilewati, bukan diberi baris ganda.
    expect(dataMigration).toContain(`IN ('${NEW_ID}', 'desa')`);
    expect(dataMigration).not.toMatch(/\b(DELETE|UPDATE|DROP)\b/i);
  });

  it('setelah migrasi (punya ID lama + baru): sidebar menampilkan menu & guard membuka halaman', () => {
    const nav = filterNavByMenuIds(navBar, [OLD_ID, NEW_ID]);
    const desa = nav.find((s) => s.id === 'Desa');
    expect(desa?.children?.map((c) => c.id)).toEqual([OLD_ID, NEW_ID]);
    for (const pathname of [NEW_PATH, `${NEW_PATH}/create`, `${NEW_PATH}/x/edit`]) {
      expect(adminGuardRedirect({ pathname, roleId: ROLE_ADMIN_DESA, nav }), pathname).toBeNull();
    }
  });

  it('tanpa ID baru, guard menolak halaman baru — itulah alasan migrasi data wajib', () => {
    const nav = filterNavByMenuIds(navBar, [OLD_ID]);
    expect(adminGuardRedirect({ pathname: NEW_PATH, roleId: ROLE_ADMIN_DESA, nav })).not.toBeNull();
  });

  it('pemegang section "Desa" dan fallback role (tanpa Menu Access) otomatis mencakup menu baru', () => {
    const bySection = filterNavByMenuIds(navBar, ['Desa']);
    expect(adminGuardRedirect({ pathname: NEW_PATH, roleId: ROLE_ADMIN_DESA, nav: bySection })).toBeNull();
    expect(adminGuardRedirect({ pathname: NEW_PATH, roleId: ROLE_ADMIN_DESA, nav: role1 })).toBeNull();
  });
});

describe('form & unggah PDF memakai komponen bersama', () => {
  const form: FormValues = {
    jenis: 'RKP', judul: 'RKP Contoh', tahun: 2026, tahunMulai: null, tahunSelesai: null, // test-only
    nomorPerdes: '', ringkasan: '', jenisMusyawarah: null, fileId: undefined,
  };

  beforeEach(() => vi.resetAllMocks());

  it('menampilkan field PDF opsional lewat PdfDropzoneField, termasuk tautan berkas saat ini', () => {
    const html = render(
      <DokumenPerencanaanForm
        form={form}
        loading={false}
        submitLabel="Simpan"
        currentFile={{ link: 'https://files.example/rkp.pdf', realName: 'rkp.pdf' }}
        onSubmit={() => undefined}
      />,
    );
    expect(html).toContain('Berkas PDF (Opsional)');
    expect(html).toContain('Seret PDF atau klik untuk memilih');
    expect(html).toContain('href="https://files.example/rkp.pdf"');
    expect(html).toContain('Berkas saat ini');
  });

  it('uploadDokumenPdf mendelegasikan ke uploadPdfFile dan meneruskan hasilnya (id atau null)', async () => {
    const file = new File(['x'], 'rkp.pdf', { type: 'application/pdf' });
    pdfUpload.uploadPdfFile.mockResolvedValueOnce('file-1');
    expect(await uploadDokumenPdf(file)).toBe('file-1');
    pdfUpload.uploadPdfFile.mockResolvedValueOnce(null);
    expect(await uploadDokumenPdf(file)).toBeNull();
    expect(pdfUpload.uploadPdfFile).toHaveBeenCalledWith(file);
  });
});
