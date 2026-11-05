// @vitest-environment node
// Alur pesanan publik UMKM (/darmasaba/ekonomi/umkm/produk/:id):
// (a) HP/warga anonim ditolak 401 karena endpoint tidak masuk whitelist,
// (b) tab WhatsApp "nomor tidak terdaftar" karena nomor kontak tak dinormalisasi,
// serta pesan error server yang hilang & race stok. Semua mock — tanpa DB.
import { describe, it, expect, vi } from 'vitest';
import { isPublicPostPath } from '@/lib/auth-policy';
import {
  buatPesanan,
  periodeOf,
  type PesanTx,
} from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/penjualan/_pesan';
import {
  PESAN_GAGAL_DEFAULT,
  buildOrderMessage,
  buildWaUrl,
  isPesananBerhasil,
  normalizeWaNumber,
  pesanErrorMessage,
} from '@/app/darmasaba/(pages)/ekonomi/umkm/_lib/pesanan';

const BASE = '/api/ekonomi/umkm/penjualan';

describe('whitelist POST anonim pesanan UMKM', () => {
  it('POST /pesan boleh tanpa login (warga anonim di HP)', () => {
    expect(isPublicPostPath(`${BASE}/pesan`)).toBe(true);
  });

  it('CRUD penjualan admin tetap butuh login', () => {
    expect(isPublicPostPath(`${BASE}/create`)).toBe(false);
    expect(isPublicPostPath(`${BASE}/pesan/`)).toBe(false);
    expect(isPublicPostPath(`${BASE}/del/abc`)).toBe(false);
  });
});

function mockTx(produk: { harga: number; stok: number } | null, updateCount: number) {
  const findFirst = vi.fn().mockResolvedValue(produk);
  const updateMany = vi.fn().mockResolvedValue({ count: updateCount });
  const create = vi.fn().mockImplementation(async ({ data }) => ({ id: 'p1', ...data }));
  const tx = {
    pasarDesa: { findFirst, updateMany },
    penjualanProduk: { create },
  } as unknown as PesanTx;
  return { tx, findFirst, updateMany, create };
}

describe('buatPesanan (inti API /pesan)', () => {
  const now = new Date(2026, 10, 5, 10, 0, 0);

  it('sukses: harga dari DB, total dihitung server, stok dikurangi atomik', async () => {
    const { tx, updateMany, create } = mockTx({ harga: 25000, stok: 10 }, 1);

    const res = await buatPesanan(tx, { produkId: 'x', jumlah: 3 }, now);

    expect(res.ok).toBe(true);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'x', stok: { gte: 3 } }),
        data: { stok: { decrement: 3 } },
      }),
    );
    expect(create.mock.calls[0][0].data).toMatchObject({
      produkId: 'x',
      jumlah: 3,
      hargaSatuan: 25000,
      totalNilai: 75000,
      periode: '2026-11',
    });
  });

  it('produk tidak ada / nonaktif → 404 dan tidak menulis apa pun', async () => {
    const { tx, updateMany, create } = mockTx(null, 0);

    const res = await buatPesanan(tx, { produkId: 'x', jumlah: 1 }, now);

    expect(res).toMatchObject({ ok: false, status: 404 });
    expect(updateMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('stok kalah race (updateMany count 0) → 409 berisi stok tersedia, tanpa catat penjualan', async () => {
    const { tx, create } = mockTx({ harga: 1000, stok: 2 }, 0);

    const res = await buatPesanan(tx, { produkId: 'x', jumlah: 5 }, now);

    expect(res).toEqual({
      ok: false,
      status: 409,
      message: 'Stok tidak mencukupi. Tersedia: 2',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('periodeOf memakai format YYYY-MM dengan bulan 2 digit', () => {
    expect(periodeOf(new Date(2026, 0, 31))).toBe('2026-01');
  });
});

describe('normalizeWaNumber (nomor kontak UMKM → wa.me)', () => {
  it.each([
    ['081234567890', '6281234567890'],
    ['+62 812-3456-7890', '6281234567890'],
    ['6281234567890', '6281234567890'],
    ['81234567890', '6281234567890'], // tanpa 0/62 — dulu jadi wa.me/8123… (tidak terdaftar)
    ['62 0812 3456 7890', '6281234567890'], // "+62 (0)812…" — dulu jadi 620812…
  ])('%s → %s', (raw, expected) => {
    expect(normalizeWaNumber(raw)).toBe(expected);
  });

  it.each([null, undefined, '', '-', '0361 123456', '0812', '08123456789012345678'])(
    'nomor tidak valid %j → null (WhatsApp tidak dibuka)',
    (raw) => {
      expect(normalizeWaNumber(raw)).toBeNull();
    },
  );
});

describe('pesanErrorMessage / isPesananBerhasil (hasil Eden treaty)', () => {
  it('respons non-2xx: pesan server dari error.value, bukan generik', () => {
    const res = {
      data: null,
      error: { status: 409, value: { success: false, message: 'Stok tidak mencukupi. Tersedia: 2' } },
    };
    expect(isPesananBerhasil(res)).toBe(false);
    expect(pesanErrorMessage(res)).toBe('Stok tidak mencukupi. Tersedia: 2');
  });

  it('401 tanpa pesan terbaca → pesan default, bukan crash', () => {
    const res = { data: null, error: { status: 401, value: 'Unauthorized' } };
    expect(pesanErrorMessage(res)).toBe(PESAN_GAGAL_DEFAULT);
  });

  it('422 validasi → pesan ramah, JSON validasi mentah tidak bocor ke warga', () => {
    const res = { data: null, error: { status: 422, value: { type: 'validation', message: '{"x":1}' } } };
    const msg = pesanErrorMessage(res);
    expect(msg).not.toContain('{');
    expect(msg).toMatch(/tidak valid/i);
  });

  it('2xx dengan success:false memakai message server', () => {
    const res = { data: { success: false, message: 'Ditolak' }, error: null };
    expect(isPesananBerhasil(res)).toBe(false);
    expect(pesanErrorMessage(res)).toBe('Ditolak');
  });

  it('sukses hanya bila success:true dan tidak ada error', () => {
    expect(isPesananBerhasil({ data: { success: true }, error: null })).toBe(true);
    expect(isPesananBerhasil({ data: { success: true }, error: { status: 500, value: null } })).toBe(false);
  });
});

describe('buildOrderMessage / buildWaUrl', () => {
  it('menyusun pesan lengkap dengan satuan dan catatan opsional', () => {
    const msg = buildOrderMessage({
      umkmNama: 'Warung Ibu',
      produkNama: 'Ikan Nila',
      jumlah: 2,
      satuan: 'kg',
      harga: 30000,
      total: 60000,
      pemesan: 'Made',
      catatan: 'Antar sore',
    });
    expect(msg).toContain('Halo *Warung Ibu*');
    expect(msg).toContain('Jumlah: 2 kg');
    expect(msg).toContain('/ kg');
    expect(msg).toContain('Nama Pemesan: Made');
    expect(msg).toContain('Catatan: Antar sore');
    expect(buildOrderMessage({ produkNama: 'A', jumlah: 1, harga: 1, total: 1, pemesan: 'B' })).not.toContain('Catatan');
  });

  it('URL wa.me meng-encode pesan', () => {
    const url = buildWaUrl('6281234567890', 'a b\nc');
    expect(url).toBe('https://wa.me/6281234567890?text=a%20b%0Ac');
  });
});
