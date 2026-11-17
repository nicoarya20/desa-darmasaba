// @vitest-environment node
// Seed Program Kemiskinan: tiga program bantuan desa (PKH, CPP, BLT Desa) dengan slug URL publik,
// slug unik, dan tanpa data penerima (data warga tidak pernah di-seed).
import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

type ProgramSeed = { id: string; slug?: string; nama: string; deskripsi: string; icon: string; tahun?: number };
const seed: ProgramSeed[] = JSON.parse(
  readFileSync(join(process.cwd(), 'prisma/data/ekonomi/program-kemiskinan/program-kemiskinan.json'), 'utf-8'),
);

describe('seed program kemiskinan', () => {
  it('memuat PKH, CPP, dan BLT Desa dengan slug tetap dan deskripsi', () => {
    const bySlug = new Map(seed.filter((p) => p.slug).map((p) => [p.slug, p]));
    expect(bySlug.get('pkh')?.nama).toBe('PKH (Program Keluarga Harapan)');
    expect(bySlug.get('cpp')?.nama).toBe('CPP (Cadangan Pangan Pemerintah)');
    expect(bySlug.get('blt-desa')?.nama).toBe('BLT Desa (Bantuan Langsung Tunai Dana Desa)');
    for (const slug of ['pkh', 'cpp', 'blt-desa']) expect(bySlug.get(slug)?.deskripsi).toMatch(/^<p>.+<\/p>$/);
  });

  it('id & slug unik; tidak ada field penerima di seed', () => {
    const slugs = seed.map((p) => p.slug).filter(Boolean);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(seed.map((p) => p.id)).size).toBe(seed.length);
    for (const p of seed) expect(Object.keys(p).some((k) => /penerima/i.test(k))).toBe(false);
  });
});
