// @vitest-environment node
// Form admin Pengumuman: logika unggah lampiran saat Simpan (urutan, id lama dipertahankan, gagal =
// error berkonteks) dan markup uploader. jsdom rusak di repo ini → markup via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), warn: vi.fn() } }));

import { DokumenPdfUploader } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/DokumenPdfUploader';
import { GaleriGambarUploader } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/GaleriGambarUploader';
import { GambarUtamaDropzone } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/GambarUtamaDropzone';
import {
  dokumenDariApi,
  galeriDariApi,
  kumpulkanLampiran,
  tambahTerbatas,
  type DokumenItem,
} from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_lib/lampiran.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (html: string, attr: string) => html.split(attr).length - 1;

// test-only: berkas tersimpan & baru
const pdf = (id: string, size: number | null = 2048) => ({ id, link: `/api/fileStorage/findUnique/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size });
const fileBaru = (name: string) => new File(['x'], name);
const dokBaru = (name: string): DokumenItem => ({ key: `new-${name}`, nama: name, preview: `blob:${name}`, size: 1, file: fileBaru(name) });

describe('logika lampiran', () => {
  it('dokumenDariApi & galeriDariApi memetakan berkas tersimpan', () => {
    expect(dokumenDariApi([pdf('d1')])).toEqual([
      { key: 'd1', id: 'd1', nama: 'd1.pdf', preview: '/api/fileStorage/findUnique/d1', size: 2048 },
    ]);
    expect(galeriDariApi([{ id: 'g1', link: '/api/img/g1.webp' }])).toEqual([{ key: 'g1', id: 'g1', preview: '/api/img/g1.webp' }]);
    expect(dokumenDariApi(undefined)).toEqual([]);
  });

  it('tambahTerbatas tidak melewati batas dan mengembalikan sisanya', () => {
    const hasil = tambahTerbatas([1, 2], [3, 4, 5], 3);
    expect(hasil).toEqual({ items: [1, 2, 3], ditolak: [4, 5] });
  });

  it('kumpulkanLampiran mengunggah hanya berkas baru, urutan tampilan dipertahankan', async () => {
    const upload = vi.fn(async (file: File) => `up-${file.name}`);
    const ids = await kumpulkanLampiran(
      {
        gambar: { id: null, file: fileBaru('poster.png'), preview: 'blob:p' },
        galeri: [{ key: 'g1', id: 'g1', preview: '/g1' }, { key: 'n', file: fileBaru('b.png'), preview: 'blob:b' }],
        dokumen: [dokBaru('lelang.pdf'), ...dokumenDariApi([pdf('d1')])],
      },
      upload,
    );
    expect(ids).toEqual({ imageId: 'up-poster.png', imageIds: ['g1', 'up-b.png'], dokumenIds: ['up-lelang.pdf', 'd1'] });
    expect(upload).toHaveBeenCalledTimes(3);
  });

  it('gambar utama lama dipertahankan / null bila dihapus', async () => {
    const upload = vi.fn();
    const lama = await kumpulkanLampiran({ gambar: { id: 'img', file: null, preview: '/img' }, galeri: [], dokumen: [] }, upload);
    expect(lama).toEqual({ imageId: 'img', imageIds: [], dokumenIds: [] });
    const hapus = await kumpulkanLampiran({ gambar: { id: null, file: null, preview: null }, galeri: [], dokumen: [] }, upload);
    expect(hapus.imageId).toBeNull();
    expect(upload).not.toHaveBeenCalled();
  });

  it('upload dokumen gagal → error yang menyebut nama berkas', async () => {
    const upload = vi.fn(async () => null);
    await expect(
      kumpulkanLampiran({ gambar: { id: null, file: null, preview: null }, galeri: [], dokumen: [dokBaru('kpm.pdf')] }, upload),
    ).rejects.toThrow('Gagal mengunggah dokumen "kpm.pdf"');
  });
});

describe('uploader admin (markup)', () => {
  it('DokumenPdfUploader: satu baris per dokumen, label Baru untuk berkas belum tersimpan, hitungan', () => {
    const items = [dokBaru('a.pdf'), ...dokumenDariApi([pdf('d1', 1536 * 1024)])];
    const html = render(<DokumenPdfUploader items={items} max={20} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(count(html, 'data-dokumen-item')).toBe(2);
    expect(count(html, '>Baru<')).toBe(1);
    expect(html).toContain('d1.pdf');
    expect(html).toContain('1,5 MB');
    expect(html).toMatch(/2<!-- -->\/<!-- -->20<!-- --> dokumen|2\/20 dokumen/);
    expect(html).toContain('Dokumen PDF (opsional)');
  });

  it('DokumenPdfUploader penuh menampilkan pesan batas', () => {
    expect(render(<DokumenPdfUploader items={[dokBaru('a.pdf')]} max={1} onAdd={vi.fn()} onRemove={vi.fn()} />)).toContain(
      'Batas 1 dokumen tercapai',
    );
  });

  it('GaleriGambarUploader: thumbnail per gambar; GambarUtamaDropzone preview hanya bila ada', () => {
    const galeri = render(
      <GaleriGambarUploader items={galeriDariApi([{ id: 'a', link: '/a' }, { id: 'b', link: '/b' }])} max={10} onAdd={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(count(galeri, 'data-galeri-thumb')).toBe(2);
    expect(render(<GambarUtamaDropzone preview={null} onSelect={vi.fn()} onRemove={vi.fn()} />)).not.toContain('data-gambar-utama-preview');
    const ada = render(<GambarUtamaDropzone preview="/api/img/x.webp" onSelect={vi.fn()} onRemove={vi.fn()} />);
    expect(ada).toContain('Hapus gambar utama');
    expect(ada).toContain('Gambar Utama (opsional)');
  });
});
