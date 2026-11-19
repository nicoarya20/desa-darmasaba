// @vitest-environment node
// UI impor CSV Produk UMKM: isi modal (awal, petunjuk, pratinjau, peringatan ganti link, galat) dan tombol
// "Impor CSV" di halaman Produk. jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
// Modal Mantine dirender lewat portal, jadi yang diuji adalah isinya (ProdukImportBody). Data rekaan (test-only).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

import ProdukUmkm from '@/app/admin/(dashboard)/ekonomi/umkm/produk/page';
import { ProdukImportBody } from '@/app/admin/(dashboard)/ekonomi/umkm/produk/_com/ProdukImportBody';
import { buatTemplateCsvProduk, parseCsvProduk } from '@/lib/umkm/produk-impor-csv';
import { gabungPratinjau, pratinjauTanpaServer, type Pratinjau } from '@/lib/umkm/umkm-impor-pratinjau';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

const noop = () => {};
const body = (o: Partial<React.ComponentProps<typeof ProdukImportBody>> = {}) =>
  render(
    <ProdukImportBody mode="lewati" tahap="kosong" hasil={null} pratinjau={null} error={null} onMode={noop} onBerkas={noop} onTemplate={noop} onBatal={noop} onImpor={noop} {...o} />,
  );

const hasilValid = parseCsvProduk(
  'nama;umkm;kategori;harga;stok;link_shopee;link_tokopedia\n' +
    'Keripik Satu;Warung A;Makanan;15000;5;https://shopee.co.id/p/1;https://www.tokopedia.com/a/b\n' +
    'Kopi Dua;Warung B;Minuman;Rp 1.250.000;;;',
);
const resp = (o: Partial<Pratinjau> = {}) => ({
  ditambah: 2,
  diperbarui: 0,
  dilewati: 0,
  galat: [],
  totalGalat: 0,
  peringatan: [{ baris: 2, alasan: "Kolom 'harga' hanya Rp 15 (kemungkinan terpotong ribuan oleh Excel)" }],
  totalPeringatan: 1,
  ...o,
});

describe('ProdukImportBody', () => {
  it('awal: petunjuk kolom, hint Excel, hint link, template, mode, input berkas; Impor nonaktif (0)', () => {
    const html = body();
    const out = text(html);
    expect(out).toContain('Format berkas CSV');
    for (const k of ['nama', 'umkm', 'kategori', 'harga', 'pemilik', 'stok', 'satuan', 'deskripsi', 'unggulan', 'link_shopee', 'link_tokopedia', 'link_tiktok_shop', 'link_blibli', 'link_lazada', 'link_lainnya']) {
      expect(out).toContain(k);
    }
    expect(out).toContain('Nama UMKM dan kategori harus sudah ada');
    expect(out).toContain('Excel: format kolom harga/stok sebagai Teks atau Angka tanpa desimal');
    expect(out).toContain('Link toko online opsional, harus diawali https://, maksimal 5 per produk.');
    expect(out).toContain('Maksimal 1000 baris dan 2 MB');
    expect(out).toContain('Unduh template CSV');
    expect(out).toContain('Jika produk sudah ada (UMKM dan nama sama)');
    expect(out).toContain('Impor (0)');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(0\)/);
  });

  it('penjelasan mode: lewati tidak mengubah data lama', () => {
    expect(text(body({ mode: 'lewati' }))).toContain('hanya produk baru yang ditambahkan');
  });

  it('penjelasan mode perbarui menyebut sel kosong tidak menimpa dan penggantian seluruh link', () => {
    const out = text(body({ mode: 'perbarui' }));
    expect(out).toContain('sel kosong di CSV tidak menimpa data lama');
    expect(out).toContain('seluruh daftar link produk itu diganti dengan isi CSV');
  });

  it('pratinjau valid: hitungan, 10 baris contoh dengan harga Rupiah, stok, penanda jumlah link; Impor aktif', () => {
    const html = body({ tahap: 'siap', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp()) });
    const out = text(html);
    expect(out).toContain('2 ditambah');
    expect(out).toContain('0 galat');
    expect(out).toContain('Keripik Satu');
    expect(out).toContain('Warung B');
    expect(out).toContain('Minuman');
    expect(out).toContain('Rp 15.000');
    expect(out).toContain('Rp 1.250.000');
    expect(out).toContain('2 link');
    expect(out).not.toContain('https://shopee.co.id/p/1');
    expect(out).toContain('Menampilkan 2 dari 2 baris yang terbaca');
    expect(out).toContain('Baris 3: Kolom');
    expect(out).toContain('Impor (2)');
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(2\)/);
  });

  it('tabel contoh dibatasi 10 baris', () => {
    const csv = 'nama;umkm;kategori;harga\n' + Array.from({ length: 12 }, (_, i) => `Produk-${i};Warung A;Makanan;1000`).join('\n');
    const h = parseCsvProduk(csv);
    const out = text(body({ tahap: 'siap', hasil: h, pratinjau: resp({ ditambah: 12, peringatan: [], totalPeringatan: 0 }) }));
    expect(out).toContain('Produk-9');
    expect(out).not.toContain('Produk-10');
    expect(out).toContain('Menampilkan 10 dari 12 baris yang terbaca');
  });

  it('perbarui dengan link diganti: peringatan kuning "N produk akan diganti daftar link toko onlinenya"', () => {
    const out = text(body({ mode: 'perbarui', tahap: 'siap', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp({ ditambah: 0, diperbarui: 2, linkDiganti: 3 })) }));
    expect(out).toContain('3 produk akan diganti daftar link toko onlinenya');
  });

  it('tanpa link diganti: tidak ada peringatan penggantian', () => {
    const out = text(body({ tahap: 'siap', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp({ linkDiganti: 0 })) }));
    expect(out).not.toContain('akan diganti daftar link');
  });

  it('pratinjau bergalat: nomor baris berkas, Impor nonaktif', () => {
    const p = pratinjauTanpaServer({ rows: hasilValid.rows, ditolak: [{ baris: 5, alasan: "Kolom 'link_shopee': URL harus diawali https://" }], galat: null });
    const html = body({ tahap: 'siap', hasil: hasilValid, pratinjau: p });
    const out = text(html);
    expect(out).toContain('1 galat');
    expect(out).toContain("Baris 5: Kolom 'link_shopee': URL harus diawali https://");
    expect(out).toContain('Impor ditolak selama ada galat');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Impor \(0\)/);
  });

  it('galat berkas dan galat server tampil sebagai Alert merah', () => {
    const a = body({ hasil: { rows: [], ditolak: [], galat: "Header CSV wajib memuat kolom 'harga'" } });
    expect(text(a)).toContain("Header CSV wajib memuat kolom 'harga'");
    expect(text(body({ tahap: 'siap', error: 'Gagal mengimpor data produk' }))).toContain('Gagal mengimpor data produk');
  });

  it('mengimpor: tombol terkunci (loading)', () => {
    const html = body({ tahap: 'mengimpor', hasil: hasilValid, pratinjau: gabungPratinjau(hasilValid, resp()) });
    expect(html).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>)[\s\S])*Batal/);
    expect(html).toContain('data-loading="true"');
  });

  it('data sel dirender sebagai teks (tidak dieksekusi sebagai HTML)', () => {
    const jahat = parseCsvProduk('nama,umkm,kategori,harga\n<img src=x onerror=alert(1)>,U,K,100');
    const html = body({ tahap: 'siap', hasil: jahat, pratinjau: resp({ peringatan: [], totalPeringatan: 0 }) });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
  });
});

describe('template CSV produk', () => {
  it('memuat kolom link dan contoh yang diberi tanda CONTOH', () => {
    const isi = buatTemplateCsvProduk();
    for (const k of ['link_shopee', 'link_tokopedia', 'link_tiktok_shop', 'link_blibli', 'link_lazada', 'link_lainnya']) expect(isi).toContain(k);
    expect(isi).toContain('CONTOH');
  });
});

describe('halaman Produk UMKM', () => {
  it('memuat tombol sekunder "Impor CSV" sebelum "Tambah Produk"', () => {
    const out = text(render(<ProdukUmkm />));
    expect(out).toContain('Impor CSV');
    expect(out).toContain('Tambah Produk');
    expect(out.indexOf('Impor CSV')).toBeLessThan(out.indexOf('Tambah Produk'));
  });
});
