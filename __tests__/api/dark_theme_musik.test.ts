// @vitest-environment node
// Dark theme Fase 3, Musik Desa (/musik/musik-desa/**, gaya TIDAL):
// 1. token --m-* di `.app, .tokens` = alias token situs --c-*; nilai tanpa token = literal terang lama + @mixin dark,
// 2. modul library/ & player/ membaca --m-* tanpa cadangan hex (semua pemakai di dalam .app / .tokens),
// 3. kaca NowPlayingBar punya pasangan gelap, ikon/inisial sampul pastel memakai --m-on-cover (tetap di dua tema),
// 4. warna ubin genre & gradasi sampul (musik-palette.ts) tidak berubah.
// Rencana: MIND/PLAN/plan-dark-theme.md ("Kontrak token", "Batch 3C").
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { COVER_TONES, GENRE_COLORS } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-palette';
import { SLIDER_FILL, SLIDER_VARS } from '@/app/(public)/(pages)/musik/musik-desa/_com/player/PlayerProgress';

const COM = path.resolve(__dirname, '../../src/app/(public)/(pages)/musik/musik-desa/_com');
const SRC = (rel: string) => readFileSync(path.join(COM, rel), 'utf8');
/** Isi CSS tanpa komentar (komentar boleh menyebut nilai hex lama). */
const CSS = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '');
/** Blok token pertama `.app,\n.tokens { … }` sampai penutupnya (termasuk @mixin dark bersarang). */
const TOKENS = CSS('app/musik-app.module.css').match(/\.app,\s*\.tokens\s*\{([\s\S]*?\n)\}/)?.[1] ?? '';
const DARK = TOKENS.match(/@mixin dark\s*\{([^{}]*)\}/)?.[1] ?? '';
const decl = (body: string, name: string) => body.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim();

describe('token --m-* = alias token situs', () => {
  it.each([
    ['--m-bg', 'var(--c-bg)'],
    ['--m-surface', 'var(--c-tile)'],
    ['--m-line', 'var(--c-line-strong)'],
    ['--m-ink', 'var(--c-ink)'],
    ['--m-muted', 'var(--c-ink-2)'],
    ['--m-subtle', 'var(--c-muted)'],
    ['--m-accent', 'var(--c-brand)'],
    ['--m-solid', 'var(--c-ink)'],
    ['--m-on-solid', 'var(--c-bg)'],
  ])('%s = %s', (name, value) => {
    expect(decl(TOKENS, name)).toBe(value);
  });

  it('nilai tanpa token situs: terang = literal lama, gelap lewat @mixin dark', () => {
    expect(decl(TOKENS, '--m-elev')).toBe('#f0f0f2');
    expect(decl(TOKENS, '--m-hover')).toBe('rgba(0, 0, 0, 0.05)');
    expect(decl(TOKENS, '--m-active')).toBe('rgba(0, 0, 0, 0.06)');
    expect(decl(TOKENS, '--m-track')).toBe('rgba(0, 0, 0, 0.12)');
    expect(decl(DARK, '--m-elev')).toBe('#2a2a2c');
    expect(decl(DARK, '--m-hover')).toBe('rgba(255, 255, 255, 0.08)');
    expect(decl(DARK, '--m-active')).toBe('rgba(255, 255, 255, 0.12)');
    expect(decl(DARK, '--m-track')).toBe('rgba(255, 255, 255, 0.2)');
  });

  it('ikon/inisial sampul pastel: --m-on-cover tetap #515154 (tidak ditimpa di gelap)', () => {
    expect(decl(TOKENS, '--m-on-cover')).toBe('#515154');
    expect(DARK).not.toContain('--m-on-cover');
    expect(CSS('library/track-cover.module.css')).toMatch(/\.icon\s*\{[^}]*color: var\(--m-on-cover\);/);
    expect(CSS('library/artist-tile.module.css')).toMatch(/\.initials\s*\{[^}]*color: var\(--m-on-cover\);/);
  });
});

describe('modul Musik tanpa cadangan hex', () => {
  const files = ['library', 'player', 'app'].flatMap((dir) =>
    readdirSync(path.join(COM, dir))
      .filter((f) => /\.(css|tsx?)$/.test(f))
      .map((f) => `${dir}/${f}`),
  );

  it.each(files)('%s: var(--m-warna) tanpa nilai cadangan', (file) => {
    expect(SRC(file)).not.toMatch(
      /var\(--m-(?:ink|muted|subtle|accent|bg|surface|elev|line|hover|active|solid|on-solid|track|on-cover),/,
    );
  });

  it.each(files.filter((f) => f.endsWith('.css') && f !== 'app/musik-app.module.css'))(
    '%s: literal warna hanya yang disengaja',
    (file) => {
      const literals = CSS(file).match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) ?? [];
      // Sengaja sama di dua tema: teks putih di ubin genre, bayangan tombol putar kartu, kaca bar (terang + pasangan gelap).
      const allowed: Record<string, string[]> = {
        'library/genre-tile.module.css': ['#fff'],
        'library/track-card.module.css': ['rgba(0, 0, 0, 0.18)'],
        'player/now-playing-bar.module.css': ['rgba(255, 255, 255, 0.82)', 'rgba(22, 22, 23, 0.86)'],
      };
      expect(literals).toEqual(allowed[file] ?? []);
    },
  );

  it('slider: isi tinta dan rel token tanpa cadangan', () => {
    expect(SLIDER_FILL).toBe('var(--m-ink)');
    expect(SLIDER_VARS).toEqual({ '--slider-track-bg': 'var(--m-track)' });
  });
});

describe('NowPlayingBar', () => {
  it('kaca putih .82 di terang, kaca gelap .86 (senada navbar) di gelap', () => {
    const tint = CSS('player/now-playing-bar.module.css').match(/\.tint\s*\{([\s\S]*?\n)\}/)?.[1] ?? '';
    expect(tint).toContain('background: rgba(255, 255, 255, 0.82);');
    expect(tint).toMatch(/@mixin dark\s*\{\s*background: rgba\(22, 22, 23, 0\.86\);\s*\}/);
  });
});

describe('palet Musik tetap (user puas dengan ubin genre)', () => {
  it('warna ubin genre & gradasi sampul tidak berubah', () => {
    expect(GENRE_COLORS).toEqual(['#7a2e3b', '#1f5f73', '#5b3a8c', '#2f6b3f', '#8a4b12', '#274a8c', '#6b2f6b', '#3d5a5a']);
    expect(COVER_TONES[0]).toEqual(['#e5f2fa', '#b8daef']);
    expect(COVER_TONES).toHaveLength(6);
  });
});
