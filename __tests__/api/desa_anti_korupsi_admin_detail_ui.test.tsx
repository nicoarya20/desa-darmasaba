// @vitest-environment node
// Detail admin DAK: render tabel (Ukuran/Diunggah), toolbar cari/urut, tombol ZIP, dan bagian dokumen terhapus.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenFolderView } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenFolderView';
import { DokumenSampahList } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenSampahList';
import {
  DokumenSampahPanel,
  DokumenTerhapusJudul,
  konfirmasiHapusPermanenText,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenSampahPanel';
import { DokumenZipButton } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenZipButton';
import type { SampahItemView } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/sampah-api';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

const dok = (id: string, judul: string, size: number | null): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan: 0,
  fileId: `f-${id}`,
  createdAt: '2026-11-09T10:00:00.000Z',
  file: { id: `f-${id}`, link: `/x/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size },
});

const detail = {
  folders: [
    { id: 'fa', nama: 'Laporan', urutan: 0, dokumen: [dok('a1', 'Laporan 2024', 3 * 1024 * 1024 + 400 * 1024), dok('a2', 'Rekap', null)] },
    { id: 'fb', nama: 'Kosong', urutan: 1, dokumen: [] },
  ],
  dokumenUmum: [dok('u1', 'Pengumuman', 512)],
};

describe('DokumenFolderView: kolom & toolbar', () => {
  it('tabel berisi kolom Ukuran & Diunggah dengan nilai terformat', () => {
    const html = render(<DokumenFolderView programId="p1" {...detail} />);
    expect(html).toContain('>Ukuran<');
    expect(html).toContain('>Diunggah<');
    const ukuran = [...html.matchAll(/data-testid="ukuran-dokumen"[^>]*>([^<]+)</g)].map((m) => m[1]);
    expect(ukuran).toEqual(['3,4 MB', '—']);
    expect(html).toMatch(/data-testid="tanggal-dokumen"[^>]*>9 Nov 2026</);
  });

  it('toolbar cari + Select urutkan; jumlah hasil hanya muncul saat mencari', () => {
    const html = render(<DokumenFolderView programId="p1" {...detail} />);
    expect(html).toContain('placeholder="Cari judul atau nama file"');
    expect(html).toContain('aria-label="Urutkan dokumen"');
    expect(html).toContain('value="Urutan asli"');
    expect(html).not.toContain('data-testid="jumlah-hasil-cari"');
  });

  it('tombol ZIP per folder (termasuk Umum); folder kosong dinonaktifkan', () => {
    const html = render(<DokumenFolderView programId="p1" {...detail} />);
    const tombol = (nama: string) => new RegExp(`<button[^>]*aria-label="Unduh ZIP ${nama}"[^>]*>`).exec(html)?.[0] ?? '';
    expect(tombol('Laporan')).not.toBe('');
    expect(tombol('Umum')).not.toBe('');
    expect(tombol('Laporan')).not.toContain('disabled');
    expect(tombol('Kosong')).toContain('disabled');
  });
});

describe('DokumenZipButton', () => {
  it('varian berlabel untuk "Unduh semua (ZIP)", nonaktif bila tidak ada dokumen', () => {
    const aktif = render(<DokumenZipButton programId="p1" label="Unduh semua (ZIP)" target="semua dokumen" />);
    expect(aktif).toContain('Unduh semua (ZIP)');
    expect(aktif).toContain('aria-label="Unduh ZIP semua dokumen"');
    expect(aktif).not.toMatch(/<button[^>]*disabled/);
    const kosong = render(<DokumenZipButton programId="p1" label="Unduh semua (ZIP)" target="semua dokumen" disabled />);
    expect(kosong).toMatch(/<button[^>]*disabled/);
  });
});

const item = (id: string, judul: string, folderId: string | null, folderNama: string | null, sisaHari: number): SampahItemView => ({
  id,
  judul,
  folderId,
  folderNama,
  file: { id: `f-${id}`, link: `/x/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf' },
  deletedAt: '2026-11-09T10:00:00.000Z',
  sisaHari,
});

describe('Dokumen terhapus', () => {
  const folders = [{ id: 'fa', nama: 'Laporan' }];
  const noop = () => undefined;

  it('daftar: judul, folder asal, tanggal dihapus, sisa hari, aksi, keterangan 30 hari', () => {
    const items = [item('s1', 'SK Kades', 'fa', 'Laporan', 29), item('s2', 'Lampiran', null, null, 0), item('s3', 'Arsip lama', 'fx', 'Arsip', 3)];
    const html = render(<DokumenSampahList items={items} folders={folders} busy={null} onPulihkan={noop} onHapus={noop} />);
    expect([...html.matchAll(/data-sampah-id="([^"]+)"/g)].map((m) => m[1])).toEqual(['s1', 's2', 's3']);
    expect(html).toContain('Dari Laporan · Dihapus 9 Nov 2026');
    expect(html).toContain('Dari Umum');
    expect(html).toContain('Dari Arsip (folder sudah dihapus)');
    expect(html).toContain('dihapus permanen dalam 29 hari');
    expect(html).toContain('dihapus permanen hari ini');
    expect(html).toContain('aria-label="Pulihkan SK Kades"');
    expect(html).toContain('aria-label="Hapus permanen SK Kades"');
    expect(html).toContain('Dokumen terhapus akan dihapus permanen otomatis setelah 30 hari.');
  });

  it('daftar kosong → empty state + keterangan tetap tampil', () => {
    const html = render(<DokumenSampahList items={[]} folders={folders} busy={null} onPulihkan={noop} onHapus={noop} />);
    expect(html).toContain('data-testid="sampah-kosong"');
    expect(html).toContain('Belum ada dokumen terhapus');
    expect(html).not.toContain('Tempat sampah');
    expect(html).toContain('setelah 30 hari');
  });

  it('item yang sedang diproses: tombolnya nonaktif', () => {
    const html = render(
      <DokumenSampahList items={[item('s1', 'SK', null, null, 5)]} folders={folders} busy={{ id: 's1', aksi: 'hapus' }} onPulihkan={noop} onHapus={noop} />,
    );
    expect(html).toMatch(/<button[^>]*aria-label="Pulihkan SK"[^>]*disabled|<button[^>]*disabled[^>]*aria-label="Pulihkan SK"/);
  });

  it('panel tertutup secara bawaan (lazy): judul "Dokumen terhapus", tanpa jumlah, daftar belum dimuat', () => {
    const html = render(<DokumenSampahPanel programId="p1" folders={folders} onRestored={noop} />);
    expect(html).toContain('Dokumen terhapus');
    expect(html).not.toMatch(/tempat sampah/i);
    expect(html).toContain('data-testid="panel-sampah"');
    expect(html).not.toContain('data-testid="sampah-kosong"');
    // Dipisah dari daftar folder oleh Divider; ikon judul = riwayat, bukan tempat sampah.
    expect(html).toContain('Riwayat');
    expect(html).toContain('tabler-icon-history');
    expect(html).not.toContain('tabler-icon-trash');
  });

  it('judul bagian: "Dokumen terhapus" + badge jumlah setelah daftar dimuat', () => {
    const html = render(<DokumenTerhapusJudul jumlah={3} />);
    expect(html).toMatch(/Dokumen terhapus<\/p>[\s\S]*>3<\/span>/);
    expect(render(<DokumenTerhapusJudul jumlah={0} />)).toMatch(/>0<\/span>/);
    expect(render(<DokumenTerhapusJudul jumlah={null} />)).not.toContain('mantine-Badge');
  });

  it('teks konfirmasi hapus permanen', () => {
    expect(konfirmasiHapusPermanenText('SK')).toBe('Hapus permanen dokumen "SK"? Tindakan ini tidak bisa dibatalkan.');
  });

  it('halaman detail memasang tombol unduh semua & panel sampah yang memuat ulang detail', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(__dirname, '../../src/app/admin/(dashboard)/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/[id]/page.tsx'),
      'utf8',
    );
    expect(src).toContain('label="Unduh semua (ZIP)"');
    expect(src).toContain('<DokumenSampahPanel');
    expect(src).toContain('onRestored={() => void detailState.findUnique.load(data.id)}');
  });
});
