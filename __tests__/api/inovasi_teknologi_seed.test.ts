// @vitest-environment node
// Seed Inovasi Teknologi Desa: satu JSON gabungan (eks Desa Digital + Info Teknologi Tepat Guna) dengan kategori sah
// dan id lama dipertahankan (id eks-InfoTekno sama dengan baris yang disalin migrasi → seed create-only tidak menggandakan).
import { describe, expect, it } from 'vitest';
import { loadJsonData } from '../../prisma/load-json';
import { isInovasiKategori } from '@/lib/inovasi-teknologi/kategori';

type SeedRow = { id: string; name: string; kategori: string; deskripsi: string; imageName?: string };
const rows = loadJsonData<SeedRow[]>('inovasi/inovasi-teknologi-desa/inovasi-teknologi-desa.json');

describe('seed inovasi-teknologi-desa.json', () => {
  it('setiap baris berkategori sah dan id unik', () => {
    expect(rows.filter((r) => !isInovasiKategori(r.kategori))).toEqual([]);
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  it('memuat kedua kategori dengan id lama (eks Desa Digital & eks InfoTekno)', () => {
    const byId = new Map(rows.map((r) => [r.id, r.kategori]));
    expect(byId.get('cmkkshcox000504l88lp54coc')).toBe('digital');
    expect(byId.get('cmkm2xlqr000mvnswdaymiho6')).toBe('tepat-guna');
  });
});
