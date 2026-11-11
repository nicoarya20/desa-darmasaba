// @vitest-environment node
// Link Toko Online produk UMKM (model LinkTokoOnline).
// Kontrak: aditif — klien lama tanpa field `linkTokoOnline` berperilaku seperti sebelumnya.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const txMock = vi.hoisted(() => ({
  linkTokoOnline: { deleteMany: vi.fn(), createMany: vi.fn() },
  pasarDesa: { update: vi.fn() },
}));
const prismaMock = vi.hoisted(() => ({
  pasarDesa: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import ProdukUmkm from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk';
import {
  MAX_LINK_PER_PRODUK,
  MAX_URL_LENGTH,
  validateLinkTokoOnline,
  validateLinkTokoOnlineList,
} from '@/lib/link-toko-online';

const VALID_BODY = { nama: 'Genteng Press', harga: 5000, umkmId: 'u1', kategoriId: 'k1' };
const UPDATE_BODY = { ...VALID_BODY, stok: 3, isActive: true };

const call = (path: string, body: unknown, method = 'POST') =>
  ProdukUmkm.handle(
    new Request(`http://localhost/umkm/produk${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  ).then((r) => r.json());

const get = (path: string) =>
  ProdukUmkm.handle(new Request(`http://localhost/umkm/produk${path}`)).then((r) => r.json());

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.pasarDesa.findMany.mockResolvedValue([]);
  prismaMock.pasarDesa.count.mockResolvedValue(0);
  prismaMock.pasarDesa.create.mockResolvedValue({ id: 'p1', linkTokoOnline: [] });
  prismaMock.pasarDesa.update.mockResolvedValue({ id: 'p1', linkTokoOnline: [] });
  txMock.pasarDesa.update.mockResolvedValue({ id: 'p1', linkTokoOnline: [] });
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof txMock) => unknown) => fn(txMock));
});

describe('validateLinkTokoOnline — protokol & format', () => {
  it.each([
    ['http', 'http://shopee.co.id/toko'],
    ['javascript', 'javascript:alert(1)'],
    ['data', 'data:text/html,<script>alert(1)</script>'],
    ['ftp', 'ftp://shopee.co.id/x'],
    ['tanpa skema', 'shopee.co.id/toko'],
  ])('menolak %s', (_nama, url) => {
    expect(validateLinkTokoOnline({ platform: 'LAINNYA', url }).ok).toBe(false);
    expect(validateLinkTokoOnline({ platform: 'SHOPEE', url }).ok).toBe(false);
  });

  it('menolak URL kosong, terlalu panjang, dan userinfo', () => {
    expect(validateLinkTokoOnline({ platform: 'LAINNYA', url: '   ' }).ok).toBe(false);
    const panjang = `https://shopee.co.id/${'a'.repeat(MAX_URL_LENGTH)}`;
    expect(validateLinkTokoOnline({ platform: 'SHOPEE', url: panjang }).ok).toBe(false);
    expect(validateLinkTokoOnline({ platform: 'LAINNYA', url: 'https://user:pw@toko.id/x' }).ok).toBe(false);
  });

  it('menolak platform tak dikenal', () => {
    expect(validateLinkTokoOnline({ platform: 'AMAZON', url: 'https://amazon.com/x' }).ok).toBe(false);
  });

  it('menerima https dan mengembalikan URL ternormalisasi', () => {
    const r = validateLinkTokoOnline({ platform: 'SHOPEE', url: '  https://shopee.co.id/toko-desa  ' });
    expect(r).toEqual({ ok: true, data: 'https://shopee.co.id/toko-desa' });
  });
});

describe('validateLinkTokoOnline — host harus cocok platform', () => {
  it.each([
    ['SHOPEE', 'https://shopee.co.id/a'],
    ['SHOPEE', 'https://shopee.com/a'],
    ['SHOPEE', 'https://shp.ee/abc'],
    ['SHOPEE', 'https://s.shopee.co.id/abc'],
    ['TOKOPEDIA', 'https://www.tokopedia.com/toko'],
    ['TOKOPEDIA', 'https://tk.tokopedia.com/abc'],
    ['TIKTOK_SHOP', 'https://www.tiktok.com/@toko'],
    ['TIKTOK_SHOP', 'https://vt.tiktok.com/ZS1/'],
    ['BLIBLI', 'https://www.blibli.com/p/x'],
    ['LAZADA', 'https://www.lazada.co.id/shop/x'],
    ['LAINNYA', 'https://tokosaya.example.id/produk'],
  ])('%s menerima %s', (platform, url) => {
    expect(validateLinkTokoOnline({ platform, url }).ok).toBe(true);
  });

  it.each([
    ['SHOPEE', 'https://tokopedia.com/toko'],
    ['TOKOPEDIA', 'https://shopee.co.id/toko'],
    ['TIKTOK_SHOP', 'https://shopee.co.id/toko'],
    ['SHOPEE', 'https://shopee.co.id.evil.com/x'],
    ['SHOPEE', 'https://evilshopee.co.id/x'],
    ['SHOPEE', 'https://evil.com/shopee.co.id'],
    ['SHOPEE', 'https://shopee.co.id@evil.com/x'],
  ])('%s menolak %s', (platform, url) => {
    expect(validateLinkTokoOnline({ platform, url }).ok).toBe(false);
  });
});

describe('validateLinkTokoOnlineList', () => {
  const link = (i: number) => ({ platform: 'LAINNYA', url: `https://toko${i}.id/p` });

  it(`menolak lebih dari ${MAX_LINK_PER_PRODUK} link`, () => {
    const enam = Array.from({ length: MAX_LINK_PER_PRODUK + 1 }, (_, i) => link(i));
    const r = validateLinkTokoOnlineList(enam);
    expect(r.ok).toBe(false);
    expect(validateLinkTokoOnlineList(enam.slice(0, MAX_LINK_PER_PRODUK)).ok).toBe(true);
  });

  it('urutan = indeks array dan urutan input terjaga', () => {
    const r = validateLinkTokoOnlineList([
      { platform: 'TOKOPEDIA', url: 'https://www.tokopedia.com/b' },
      { platform: 'SHOPEE', url: 'https://shopee.co.id/a' },
      { platform: 'LAINNYA', url: 'https://c.id/c' },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.map((d) => [d.platform, d.urutan])).toEqual([
        ['TOKOPEDIA', 0],
        ['SHOPEE', 1],
        ['LAINNYA', 2],
      ]);
    }
  });

  it('pesan error menyebut nomor link yang salah', () => {
    const r = validateLinkTokoOnlineList([link(1), { platform: 'SHOPEE', url: 'http://shopee.co.id/x' }]);
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.message).toContain('#2');
  });

  it('array kosong valid; bukan array tidak valid', () => {
    expect(validateLinkTokoOnlineList([])).toEqual({ ok: true, data: [] });
    expect(validateLinkTokoOnlineList('x').ok).toBe(false);
  });
});

describe('POST /create', () => {
  it('menolak link http/javascript/data tanpa menyentuh DB', async () => {
    for (const url of ['http://shopee.co.id/x', 'javascript:alert(1)', 'data:text/html,x']) {
      const res = await call('/create', {
        ...VALID_BODY,
        linkTokoOnline: [{ platform: 'LAINNYA', url }],
      });
      expect(res.success).toBe(false);
    }
    expect(prismaMock.pasarDesa.create).not.toHaveBeenCalled();
  });

  it('menolak host yang tidak cocok platform dan >5 link', async () => {
    const mismatch = await call('/create', {
      ...VALID_BODY,
      linkTokoOnline: [{ platform: 'SHOPEE', url: 'https://tokopedia.com/x' }],
    });
    const enam = await call('/create', {
      ...VALID_BODY,
      linkTokoOnline: Array.from({ length: 6 }, (_, i) => ({ platform: 'LAINNYA', url: `https://t${i}.id/x` })),
    });
    expect(mismatch.success).toBe(false);
    expect(enam.success).toBe(false);
    expect(prismaMock.pasarDesa.create).not.toHaveBeenCalled();
  });

  it('menulis link berurutan lewat nested create dalam satu panggilan produk', async () => {
    const res = await call('/create', {
      ...VALID_BODY,
      linkTokoOnline: [
        { platform: 'TOKOPEDIA', url: 'https://www.tokopedia.com/b' },
        { platform: 'SHOPEE', url: 'https://shopee.co.id/a' },
      ],
    });
    expect(res.success).toBe(true);
    const arg = prismaMock.pasarDesa.create.mock.calls[0][0];
    expect(arg.data.linkTokoOnline.create).toEqual([
      { platform: 'TOKOPEDIA', url: 'https://www.tokopedia.com/b', urutan: 0 },
      { platform: 'SHOPEE', url: 'https://shopee.co.id/a', urutan: 1 },
    ]);
  });

  it('tanpa field linkTokoOnline → data create tidak memuat relasi link (kompatibel)', async () => {
    const res = await call('/create', VALID_BODY);
    expect(res.success).toBe(true);
    const arg = prismaMock.pasarDesa.create.mock.calls[0][0];
    expect(arg.data).not.toHaveProperty('linkTokoOnline');
  });
});

describe('PUT /:id', () => {
  const putLinks = (linkTokoOnline: unknown) => call('/p1', { ...UPDATE_BODY, linkTokoOnline }, 'PUT');

  it('mengganti link: hapus lama → tulis baru → update produk, dalam satu transaksi', async () => {
    const order: string[] = [];
    txMock.linkTokoOnline.deleteMany.mockImplementation(async () => order.push('delete'));
    txMock.linkTokoOnline.createMany.mockImplementation(async () => order.push('create'));
    txMock.pasarDesa.update.mockImplementation(async () => {
      order.push('update');
      return { id: 'p1' };
    });

    const res = await putLinks([
      { platform: 'SHOPEE', url: 'https://shopee.co.id/baru' },
      { platform: 'LAINNYA', url: 'https://toko.id/baru' },
    ]);

    expect(res.success).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['delete', 'create', 'update']);
    expect(txMock.linkTokoOnline.deleteMany).toHaveBeenCalledWith({ where: { produkId: 'p1' } });
    expect(txMock.linkTokoOnline.createMany).toHaveBeenCalledWith({
      data: [
        { platform: 'SHOPEE', url: 'https://shopee.co.id/baru', urutan: 0, produkId: 'p1' },
        { platform: 'LAINNYA', url: 'https://toko.id/baru', urutan: 1, produkId: 'p1' },
      ],
    });
    expect(prismaMock.pasarDesa.update).not.toHaveBeenCalled();
  });

  it('array kosong menghapus semua link tanpa createMany', async () => {
    const res = await putLinks([]);
    expect(res.success).toBe(true);
    expect(txMock.linkTokoOnline.deleteMany).toHaveBeenCalledTimes(1);
    expect(txMock.linkTokoOnline.createMany).not.toHaveBeenCalled();
  });

  it('tanpa field linkTokoOnline → link tidak disentuh, tanpa transaksi', async () => {
    const res = await call('/p1', UPDATE_BODY, 'PUT');
    expect(res.success).toBe(true);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.linkTokoOnline.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.pasarDesa.update).toHaveBeenCalledTimes(1);
  });

  it('link tidak valid ditolak sebelum transaksi dimulai', async () => {
    const res = await putLinks([{ platform: 'SHOPEE', url: 'javascript:alert(1)' }]);
    expect(res.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('kegagalan di dalam transaksi dilaporkan sebagai gagal', async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error('rollback'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await putLinks([{ platform: 'LAINNYA', url: 'https://toko.id/x' }]);
    expect(res).toEqual({ success: false, message: 'Gagal memperbarui produk UMKM' });
  });
});

describe('GET output', () => {
  it('find-many memuat link dalam satu query (include), terurut urutan, hanya yang aktif', async () => {
    await get('/find-many');
    expect(prismaMock.pasarDesa.findMany).toHaveBeenCalledTimes(1);
    const include = prismaMock.pasarDesa.findMany.mock.calls[0][0].include;
    expect(include.linkTokoOnline.where).toEqual({ deletedAt: null, isActive: true });
    expect(include.linkTokoOnline.orderBy[0]).toEqual({ urutan: 'asc' });
  });

  it('find-many tetap memuat field lama (kontrak aditif)', async () => {
    await get('/find-many');
    const include = prismaMock.pasarDesa.findMany.mock.calls[0][0].include;
    expect(include).toMatchObject({ image: true, kategoriProduk: true });
    expect(include.umkm).toEqual({ include: { kategori: true } });
  });

  it('detail produk tanpa link → linkTokoOnline array kosong, field lain utuh', async () => {
    prismaMock.pasarDesa.findUnique.mockResolvedValue({
      id: 'p1', nama: 'A', deletedAt: null, linkTokoOnline: [],
    });
    const res = await get('/p1');
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ id: 'p1', nama: 'A', linkTokoOnline: [] });
  });

  it('detail produk memuat link sesuai urutan dari DB', async () => {
    const links = [{ id: 'l1', urutan: 0 }, { id: 'l2', urutan: 1 }];
    prismaMock.pasarDesa.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null, linkTokoOnline: links });
    const res = await get('/p1');
    expect(res.data.linkTokoOnline.map((l: { id: string }) => l.id)).toEqual(['l1', 'l2']);
    expect(prismaMock.pasarDesa.findUnique.mock.calls[0][0].include.linkTokoOnline.orderBy[0]).toEqual({ urutan: 'asc' });
  });

  it('produk soft-delete → link ikut tersembunyi dari output', async () => {
    prismaMock.pasarDesa.findUnique.mockResolvedValue({
      id: 'p1', deletedAt: new Date(), linkTokoOnline: [{ id: 'l1' }],
    });
    const res = await get('/p1');
    expect(res.data.linkTokoOnline).toEqual([]);
  });
});
