// @vitest-environment node
// Harga produk UMKM opsional (v0.1.355): harga tidak tetap boleh dikosongkan. API create/update menerima null,
// pesanan website menolak produk tanpa harga, impor CSV menerima sel/kolom harga kosong, admin menampilkan "-",
// dan publik menampilkan "Harga menyesuaikan" (kecuali admin menyembunyikan semua harga). Semua mock — tanpa DB.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({ pasarDesa: { create: vi.fn(), update: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/api-auth', () => ({ requireAuth: vi.fn() })); // produk/index memuat admin-guard; tidak dipakai di sini
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import ProdukUmkm from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk';
import { buatPesanan, PESAN_HARGA_KOSONG, type PesanTx } from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/penjualan/_pesan';
import { ProdukInfo } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukInfo';
import { toDetailProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.adapter.logic';
import { toKatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-adapter.logic';
import { produkFacets } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { ProdukCard } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/ProdukCard';
import { terapkanHarga } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/harga-publik.source';
import { formatHargaAdmin, HARGA_MENYESUAIKAN, hargaDariInput } from '@/lib/umkm/harga-produk';
import { parseCsvProduk } from '@/lib/umkm/produk-impor-csv';
import { susunRencanaProduk } from '@/lib/umkm/produk-impor-rencana';
import { validasiBarisProduk } from '@/lib/umkm/produk-impor.rules';
import { KNOWLEDGE_SOURCES } from '@/lib/jenna/knowledge/sources';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// test-only: isian produk rekaan.
const CREATE = { nama: 'Daging Babi', umkmId: 'umkm-1', kategoriId: 'kat-1' };
const UPDATE = { ...CREATE, stok: 0, isActive: true };
const kirim = (path: string, body: unknown, method: string) =>
  ProdukUmkm.handle(
    new Request(`http://localhost/umkm/produk${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.pasarDesa.create.mockResolvedValue({ id: 'p1' });
  prismaMock.pasarDesa.update.mockResolvedValue({ id: 'p1' });
});

describe('helper harga-produk', () => {
  it('isian kosong → null (bukan 0), angka dipertahankan', () => {
    expect(hargaDariInput('')).toBeNull();
    expect(hargaDariInput('  ')).toBeNull();
    expect(hargaDariInput(15000)).toBe(15000);
    expect(hargaDariInput('15000')).toBe(15000);
    expect(hargaDariInput(0)).toBe(0);
    expect(hargaDariInput(Number.NaN)).toBeNull();
  });

  it('tabel admin: kosong → "-"', () => {
    expect(formatHargaAdmin(null)).toBe('-');
    expect(formatHargaAdmin(undefined)).toBe('-');
    expect(formatHargaAdmin(80000)).toBe('Rp 80.000');
  });
});

describe('API produk', () => {
  it('create tanpa harga → disimpan null', async () => {
    const res = await kirim('/create', CREATE, 'POST');
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.create.mock.calls[0][0].data.harga).toBeNull();
  });

  it('create dengan harga null atau angka diterima', async () => {
    await kirim('/create', { ...CREATE, harga: null }, 'POST');
    await kirim('/create', { ...CREATE, harga: 25000 }, 'POST');
    expect(prismaMock.pasarDesa.create.mock.calls.map((c) => c[0].data.harga)).toEqual([null, 25000]);
  });

  it('update: harga null mengosongkan harga; harga tetap wajib dikirim (bentuk lama)', async () => {
    const ok = await kirim('/p1', { ...UPDATE, harga: null }, 'PUT');
    expect(ok.status).toBe(200);
    expect(prismaMock.pasarDesa.update.mock.calls[0][0].data.harga).toBeNull();

    const tanpa = await kirim('/p1', UPDATE, 'PUT');
    expect(tanpa.status).toBeGreaterThanOrEqual(400);
    expect(tanpa.status).toBeLessThan(500);
  });
});

describe('pesanan website', () => {
  it('produk tanpa harga → 409, stok tidak disentuh', async () => {
    const updateMany = vi.fn();
    const create = vi.fn();
    const tx = {
      pasarDesa: { findFirst: vi.fn().mockResolvedValue({ harga: null, stok: 10 }), updateMany },
      penjualanProduk: { create },
    } as unknown as PesanTx;
    expect(await buatPesanan(tx, { produkId: 'p1', jumlah: 1 })).toEqual({ ok: false, status: 409, message: PESAN_HARGA_KOSONG });
    expect(updateMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});

describe('impor CSV produk', () => {
  const dasar = { nama: 'Keripik', umkm: 'Warung A', kategori: 'Makanan' };
  const kategori = [{ id: 'k1', nama: 'Makanan' }];
  const umkm = [{ id: 'u1', nama: 'Warung A', pemilik: 'Made', isActive: true }];

  it('sel harga kosong → baris valid tanpa harga; harga tidak valid tetap ditolak', () => {
    const r = validasiBarisProduk({ ...dasar, harga: '' });
    expect(r.ok && r.value).toEqual(dasar);
    expect(validasiBarisProduk({ ...dasar, harga: 'murah' }).ok).toBe(false);
  });

  it('header tanpa kolom harga diterima', () => {
    const h = parseCsvProduk('nama;umkm;kategori\nKeripik;Warung A;Makanan');
    expect(h.galat).toBeFalsy();
    expect(h.rows).toHaveLength(1);
  });

  it('produk baru tanpa harga; mode perbarui tidak menimpa harga lama; tanpa peringatan harga', () => {
    const baru = susunRencanaProduk({ rows: [dasar], mode: 'lewati', kategori, umkm, ada: [] });
    expect(baru.tambah[0]).not.toHaveProperty('harga');
    expect(baru.peringatan).toEqual([]);

    const ada = [{ id: 'p-lama', umkmId: 'u1', nama: 'Keripik' }];
    const ubah = susunRencanaProduk({ rows: [{ ...dasar, stok: '4' }], mode: 'perbarui', kategori, umkm, ada });
    expect(ubah.perbarui[0].data).not.toHaveProperty('harga');
    expect(ubah.perbarui[0].data.stok).toBe(4);
  });
});

describe('publik: "Harga menyesuaikan"', () => {
  const apiProduk = { id: 'p1', nama: 'Daging Babi', harga: null, satuan: 'kg', stok: 0, createdAt: '2026-11-01' };

  it('adapter: harga null → hargaMenyesuaikan; berharga → false', () => {
    expect(toKatalogProduk(apiProduk)).toMatchObject({ harga: null, hargaMenyesuaikan: true });
    expect(toKatalogProduk({ ...apiProduk, harga: 5000 })).toMatchObject({ harga: 5000, hargaMenyesuaikan: false });
  });

  it('kartu: teks "Harga menyesuaikan" tanpa akhiran satuan', () => {
    const html = render(<ProdukCard produk={toKatalogProduk(apiProduk)} />);
    expect(text(html)).toContain(HARGA_MENYESUAIKAN);
    expect(text(html)).not.toMatch(/Rp|\/ kg/);
  });

  it('saklar sembunyikan harga aktif → teks pengganti juga tidak tampil', () => {
    const html = render(<ProdukCard produk={terapkanHarga(toKatalogProduk(apiProduk), false)} />);
    expect(text(html)).not.toContain(HARGA_MENYESUAIKAN);
  });

  it('detail: "Harga menyesuaikan" + tombol WhatsApp penjual', () => {
    const produk = toDetailProduk({ ...apiProduk, umkm: { id: 'u1', nama: 'Warung', kontak: '081234567890' } }, (h) => h);
    const html = render(<ProdukInfo produk={produk} onTercatat={() => undefined} />);
    expect(text(html)).toContain(HARGA_MENYESUAIKAN);
    expect(text(html)).toContain('Hubungi Penjual (WhatsApp)');
  });

  it('filter harga tetap ada bila sebagian produk berharga', () => {
    const campur = [toKatalogProduk(apiProduk), toKatalogProduk({ ...apiProduk, id: 'p2', harga: 5000 })];
    expect(produkFacets(campur).harga).toBe(true);
    expect(produkFacets([toKatalogProduk(apiProduk)]).harga).toBe(false);
  });
});

describe('Jenna', () => {
  it('produk tanpa harga ditulis "Harga menyesuaikan", bukan kosong', () => {
    const sumber = KNOWLEDGE_SOURCES.find((x) => x.key === 'produk_umkm');
    const teks = sumber?.toText({ nama: 'Daging Babi', harga: null, umkm: { nama: 'Warung' } }) ?? '';
    expect(teks).toContain(`Harga (Rp): ${HARGA_MENYESUAIKAN}`);
    expect(sumber?.toText({ nama: 'Telur', harga: 2500, umkm: { nama: 'Warung' } })).toContain('Harga (Rp): 2500');
  });
});
