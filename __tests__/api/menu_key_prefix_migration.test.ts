// @vitest-environment node
// Migration data-only MenuVisibility.menuKey: buang prefix '/darmasaba' karena website publik
// pindah ke root. Test menjaga guard idempoten/anti-bentrok-unique dan konstanta substring
// cocok dengan href submenu nyata (tidak menjalankan SQL; DB tidak disentuh).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import { isKnownMenuKey } from '@/app/(public)/_com/menu-visibility.logic';

const MIGRATION = path.resolve(
  __dirname,
  '../../prisma/migrations/20261111120000_strip_darmasaba_prefix_menu_key/migration.sql',
);
const sql = readFileSync(MIGRATION, 'utf8');
/** SQL tanpa komentar, spasi dinormalisasi. */
const code = sql.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim();
const LEGACY_PREFIX = '/darmasaba';
const SUBSTRING_FROM = 11;

/** Padanan JS untuk `substring(key from 11)` Postgres (indeks 1-based). */
const stripPrefix = (key: string) => key.slice(SUBSTRING_FROM - 1);

describe('migration strip prefix menuKey', () => {
  it('menjelaskan alasan perubahan di komentar dan tidak mengubah schema', () => {
    expect(sql).toMatch(/^-- Website publik pindah dari \/darmasaba/);
    expect(code).not.toMatch(/\b(ALTER|CREATE|DROP)\b/i);
  });

  it('DELETE row berprefix yang versi tanpa-prefix-nya sudah ada, SEBELUM UPDATE (hindari bentrok unique)', () => {
    const del = code.indexOf('DELETE FROM "MenuVisibility"');
    const upd = code.indexOf('UPDATE "MenuVisibility"');
    expect(del).toBeGreaterThanOrEqual(0);
    expect(upd).toBeGreaterThan(del);
    expect(code).toContain(
      `WHERE legacy."menuKey" LIKE '${LEGACY_PREFIX}/%' AND EXISTS ( SELECT 1 FROM "MenuVisibility" AS cur WHERE cur."menuKey" = substring(legacy."menuKey" from ${SUBSTRING_FROM}) )`,
    );
  });

  it('UPDATE hanya menyentuh key berprefix (idempoten: run kedua tidak menemukan baris)', () => {
    expect(code).toContain(
      `UPDATE "MenuVisibility" SET "menuKey" = substring("menuKey" from ${SUBSTRING_FROM}) WHERE "menuKey" LIKE '${LEGACY_PREFIX}/%';`,
    );
  });

  it('substring dari karakter ke-11 tepat membuang prefix /darmasaba', () => {
    expect(LEGACY_PREFIX.length).toBe(SUBSTRING_FROM - 1);
  });

  it('setiap href submenu: key lama berprefix → href sekarang, diawali "/" dan dikenali aplikasi', () => {
    const hrefs = navbarListMenu.flatMap((m) => (m.children ?? []).map((c) => c.href)).filter(Boolean) as string[];
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const migrated = stripPrefix(`${LEGACY_PREFIX}${href}`);
      expect(migrated).toBe(href);
      expect(migrated.startsWith('/')).toBe(true);
      expect(isKnownMenuKey(migrated)).toBe(true);
    }
  });
});
