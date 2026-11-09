// @vitest-environment node
// Penggabungan Penghargaan → PrestasiDesa: data seed & migrasi harus mengikuti aturan yang sama
// (satu entri per capaian; judul kembar tidak dibuat dua kali, juara ditaruh di prestasi yang ada).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(path.join(ROOT, 'prisma/data', rel), 'utf8')) as T;
const MIGRATION = readFileSync(
  path.join(ROOT, 'prisma/migrations/20261109120000_merge_penghargaan_into_prestasi_desa/migration.sql'),
  'utf8',
);

type Kategori = { id: string; name: string };
type Prestasi = { id: string; name: string; juara?: string; kategoriId: string; imageName?: string };

const KATEGORI_PENGHARGAAN_ID = 'kategori-prestasi-penghargaan';
const kategori = readJson<Kategori[]>('landing-page/prestasi-desa/kategori-prestasi.json');
const prestasi = readJson<Prestasi[]>('landing-page/prestasi-desa/prestasi-desa.json');
const byId = new Map(prestasi.map((p) => [p.id, p]));

describe('seed prestasi gabungan', () => {
  it('kategori "Penghargaan" punya id deterministik yang sama dengan migrasi', () => {
    expect(kategori).toContainEqual({ id: KATEGORI_PENGHARGAAN_ID, name: 'Penghargaan' });
    expect(MIGRATION).toContain(`VALUES ('${KATEGORI_PENGHARGAAN_ID}', 'Penghargaan'`);
  });

  it('tidak ada judul kembar (trim, case-insensitive)', () => {
    const keys = prestasi.map((p) => p.name.trim().toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('item eks-penghargaan memakai id lama, kategori Penghargaan, dan juara', () => {
    for (const id of ['cmkal9dd70002vnexhvn4j2fv', 'cmkalfbux0005vnexj8zplube', 'cmkalgucu000bvnexw2blt1v3']) {
      const item = byId.get(id);
      expect(item?.kategoriId).toBe(KATEGORI_PENGHARGAAN_ID);
      expect(item?.juara?.trim()).toBeTruthy();
    }
  });

  it('penghargaan yang judulnya kembar dengan prestasi tidak dibuat ulang; juaranya pindah ke prestasi itu', () => {
    expect(byId.has('cmkalg6hk0008vnexmsqwd3n7')).toBe(false);
    const existing = byId.get('cmdws0sgq000bvnd32o7m94im');
    expect(existing?.juara).toBe('Juara 1 Lomba Desa Provinsi Bali 2025');
    expect(existing?.kategoriId).toBe('cmdwrp0pr0002vnd35w6nkjh0');
  });

  it('setiap kategoriId merujuk kategori yang di-seed', () => {
    const ids = new Set(kategori.map((k) => k.id));
    expect(prestasi.filter((p) => !ids.has(p.kategoriId))).toEqual([]);
  });
});

describe('migration.sql penggabungan', () => {
  const at = (needle: string) => {
    const i = MIGRATION.indexOf(needle);
    expect(i, needle).toBeGreaterThan(-1);
    return i;
  };

  it('urutan: kolom juara → kategori → lengkapi kembaran → salin → drop tabel', () => {
    const order = [
      at('ADD COLUMN IF NOT EXISTS "juara" TEXT'),
      at('INSERT INTO "KategoriPrestasiDesa"'),
      at('UPDATE "PrestasiDesa" pr'),
      at('INSERT INTO "PrestasiDesa"'),
      at('DROP TABLE IF EXISTS "Penghargaan"'),
    ];
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('idempotent: kategori & salinan tidak menimpa, langkah data hanya jalan bila tabel lama masih ada', () => {
    expect(MIGRATION).toMatch(/'Penghargaan', NOW\(\), NOW\(\), true\)\s*ON CONFLICT DO NOTHING;/);
    expect(MIGRATION).toContain('ON CONFLICT ("id") DO NOTHING');
    expect(MIGRATION).toMatch(/IF EXISTS \(\s*SELECT 1 FROM information_schema\.tables[\s\S]*table_name = 'Penghargaan'/);
  });

  it('dedupe: hanya mencocokkan prestasi AKTIF berjudul sama, dan hanya mengisi juara/imageId yang masih NULL', () => {
    expect(MIGRATION).toContain('"juara" = COALESCE(pr."juara", m."juara")');
    expect(MIGRATION).toContain('"imageId" = COALESCE(pr."imageId", m."imageId")');
    const notExists = MIGRATION.slice(at('WHERE NOT EXISTS'), at('ON CONFLICT ("id")'));
    expect(notExists).toContain('LOWER(BTRIM(pr."name")) = LOWER(BTRIM(p."name"))');
    expect(notExists).toContain('pr."isActive" = true');
    expect(notExists).toContain('pr."deletedAt" IS NULL');
  });

  it('soft-delete: penghargaan aktif → deletedAt NULL (deletedAt lama default now() bukan penanda hapus)', () => {
    expect(MIGRATION).toContain('CASE WHEN p."isActive" THEN NULL ELSE p."deletedAt" END');
  });
});
