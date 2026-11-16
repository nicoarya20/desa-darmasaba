// @vitest-environment node
// Pencarian global publik tidak boleh memuat data per orang warga (UU PDP, aspek 8 lomba; T20):
// siswa (anak di bawah umur), responden IKM, permohonan informasi publik (NIK/HP/alamat), keberatan PPID,
// serta model yang GET-nya admin-only (pendaftar beasiswa, peminjam buku, ibu hamil, balita, pengaduan, administrasi online,
// ide inovatif, pendaftaran jadwal kesehatan).
// Prisma ditiru dengan Proxy: setiap model.findMany mengembalikan satu baris rekaan, panggilan dicatat per model.
// Keputusan: docs/decisions/2026-11-17-api-data-pribadi-admin-only.md
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dipanggil = vi.hoisted(() => new Set<string>());
vi.mock('@/lib/prisma', () => {
  const model = (nama: string) =>
    new Proxy(
      {},
      {
        get: (_t, metode) =>
          vi.fn(async () => {
            dipanggil.add(nama);
            return metode === 'findMany' ? [{ id: `${nama}-1`, name: 'Rekaan', nama: 'Rekaan', posisi: { nama: 'Rekaan' } }] : null; // test-only
          }),
      },
    );
  return { default: new Proxy({}, { get: (_t, nama: string) => model(nama) }) };
});

import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';

const MODEL_DATA_PRIBADI = [
  'siswa',
  'responden',
  'permohonanInformasiPublik',
  'formulirPermohonanKeberatan',
  'beasiswaPendaftar',
  'peminjamanBuku',
  'ibuHamil',
  'balita',
  'pengaduanMasyarakat',
  'administrasiOnline',
  'ajukanIdeInovatif',
  'pendaftaranJadwalKegiatan',
];
const TIPE_DATA_PRIBADI = ['siswa', 'responden', 'permohonaninformasipublik', 'permohonaninformasikeberatanpublik'];

type Hasil = { data: { type?: string }[] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const cari = (query: Record<string, string>) => searchFindMany({ query } as any) as Promise<Hasil>;

beforeEach(() => dipanggil.clear());

describe('pencarian global tanpa data pribadi warga', () => {
  it('semua modul: tidak menyentuh model data pribadi, tidak ada tipe data pribadi di hasil', async () => {
    const { data } = await cari({ query: 'Rekaan' });
    expect(dipanggil.has('berita')).toBe(true);
    expect(dipanggil.has('pengajar')).toBe(true);
    for (const m of MODEL_DATA_PRIBADI) expect(dipanggil.has(m), m).toBe(false);
    const tipe = new Set(data.map((d) => d.type));
    expect(tipe.has('pengajar')).toBe(true);
    for (const t of TIPE_DATA_PRIBADI) expect(tipe.has(t), t).toBe(false);
  });

  it.each(TIPE_DATA_PRIBADI)('type=%s tidak lagi membuka cabang khusus data pribadi', async (type) => {
    const { data } = await cari({ query: '5100000000000001', type }); // test-only: NIK rekaan
    for (const m of MODEL_DATA_PRIBADI) expect(dipanggil.has(m), m).toBe(false);
    expect(data.some((d) => TIPE_DATA_PRIBADI.includes(d.type ?? ''))).toBe(false);
  });
});
