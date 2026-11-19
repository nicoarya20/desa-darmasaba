// @vitest-environment node
// UI impor CSV Data UMKM: isi modal (awal, galat, pratinjau valid/bergalat) dan tombol "Impor CSV" di halaman.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & fetch tidak jalan di server).
// Modal Mantine dirender lewat portal, jadi yang diuji adalah isinya (UmkmImportBody). Data rekaan (test-only).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

import DataUmkm from '@/app/admin/(dashboard)/ekonomi/umkm/data-umkm/page';
import { UmkmImportBody } from '@/app/admin/(dashboard)/ekonomi/umkm/data-umkm/_com/UmkmImportBody';
import { parseCsvUmkm } from '@/lib/umkm/umkm-impor-csv';
import { gabungPratinjau, pratinjauTanpaServer, type Pratinjau } from '@/lib/umkm/umkm-impor-pratinjau';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

const noop = () => {};
const body = (o: Partial<React.ComponentProps<typeof UmkmImportBody>> = {}) =>
  render(
    <UmkmImportBody mode="lewati" tahap="kosong" hasil={null} pratinjau={null} error={null} onMode={noop} onBerkas={noop} onTemplate={noop} onBatal={noop} onImpor={noop} {...o} />,
  );

const hasilValid = parseCsvUmkm('nama;pemilik;kategori;kontak\nWarung Satu;Bu Satu;Makanan;81234567890\nWarung Dua;Pak Dua;Kerajinan;0812');
const resp = (o: Partial<Pratinjau> = {}) => ({
  ditambah: 2,
  diperbarui: 0,
  dilewati: 0,
  galat: [],
  totalGalat: 0,
  peringatan: [{ baris: 1, alasan: 'Kontak tampak kehilangan angka 0 di depan' }],
  totalPeringatan: 1,
  ...o,
});

describe('UmkmImportBody', () => {
  it('awal: petunjuk format, tombol template, pilihan mode, input berkas; Impor nonaktif (0)', () => {
    const html = body();
    const out = text(html);
    expect(out).toContain('Format berkas CSV');
    expect(out).toContain('Unduh template CSV');
    expect(out).toContain('Lewati');
    expect(out).toContain('Perbarui');
    expect(out).toContain('Berkas CSV');
    expect(out).toContain('Impor (0)');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(0\)/);
    expect(out).not.toContain('Memeriksa berkas');
  });

  it('tahap membaca: penanda memeriksa berkas, kontrol dikunci', () => {
    const html = body({ tahap: 'membaca' });
    expect(text(html)).toContain('Memeriksa berkas');
    expect(html).toMatch(/<input[^>]*disabled=""[^>]*type="radio"/);
  });

  it('galat berkas / galat server tampil sebagai Alert merah dalam modal', () => {
    const a = body({ hasil: { rows: [], ditolak: [], galat: "Header CSV wajib memuat kolom 'kategori'" } });
    expect(text(a)).toContain("Header CSV wajib memuat kolom 'kategori'");
    const b = body({ tahap: 'siap', error: 'Gagal mengimpor data UMKM' });
    expect(text(b)).toContain('Gagal mengimpor data UMKM');
    expect(b).toContain('data-variant');
  });

  it('pratinjau valid: lencana hitungan, tabel contoh, peringatan kontak, Impor aktif', () => {
    const html = body({ tahap: 'siap', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp()) });
    const out = text(html);
    expect(out).toContain('2 ditambah');
    expect(out).toContain('0 galat');
    expect(out).toContain('Warung Satu');
    expect(out).toContain('Pak Dua');
    expect(out).toContain('Menampilkan 2 dari 2 baris yang terbaca');
    expect(out).toContain('Peringatan (tidak menghalangi impor)');
    expect(out).toContain('Baris 2: Kontak tampak kehilangan angka 0 di depan');
    expect(out).toContain('Impor (2)');
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(2\)/);
  });

  it('pratinjau bergalat: daftar galat dengan nomor baris berkas, Impor nonaktif', () => {
    const p = pratinjauTanpaServer({ rows: hasilValid.rows, ditolak: [{ baris: 5, alasan: "Kolom 'nama' wajib diisi" }], galat: null });
    const html = body({ tahap: 'siap', hasil: hasilValid, pratinjau: p });
    const out = text(html);
    expect(out).toContain('1 galat');
    expect(out).toContain("Baris 5: Kolom 'nama' wajib diisi");
    expect(out).toContain('Impor ditolak selama ada galat');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(0\)/);
  });

  it('daftar galat dipotong 20 + "dan N lainnya"', () => {
    const galat = Array.from({ length: 20 }, (_, i) => ({ baris: i + 2, alasan: 'x' }));
    const p = resp({ ditambah: 0, galat, totalGalat: 45, peringatan: [], totalPeringatan: 0 });
    const out = text(body({ tahap: 'siap', hasil: hasilValid, pratinjau: p }));
    expect(out).toContain('dan 25 lainnya');
  });

  it('mengimpor: tombol Batal & Impor terkunci (loading)', () => {
    const html = body({ tahap: 'mengimpor', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp()) });
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Batal/);
    expect(html).toContain('data-loading="true"');
  });

  it('data sel dirender sebagai teks (tidak dieksekusi sebagai HTML)', () => {
    const jahat = parseCsvUmkm('nama,pemilik,kategori\n<img src=x onerror=alert(1)>,P,K');
    const html = body({ tahap: 'siap', hasil: jahat, pratinjau: resp({ peringatan: [], totalPeringatan: 0 }) });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
  });
});

describe('halaman Data UMKM', () => {
  it('memuat tombol sekunder "Impor CSV" di samping "Tambah UMKM"', () => {
    const out = text(render(<DataUmkm />));
    expect(out).toContain('Impor CSV');
    expect(out).toContain('Tambah UMKM');
    expect(out.indexOf('Impor CSV')).toBeLessThan(out.indexOf('Tambah UMKM'));
  });
});
