// @vitest-environment node
// Gambar CMS kecil di hero beranda (ikon media sosial + logo Program Inovasi) ditawarkan lewat `?size=` dengan daftar
// lebar kecil & tetap, supaya browser tidak mengunduh unggahan 720–1920px untuk tampilan 22px / kotak 72px.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (hanya atribut HTML).
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { HeroSosmed } from '@/app/(public)/_com/main-page/landing-page/HeroInfo';
import { HeroPrograms, type ProgramInovasiItem } from '@/app/(public)/_com/main-page/landing-page/HeroPrograms';
import type { SosmedItem } from '@/app/(public)/_com/main-page/landing-page/use-landing-data';

const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const imgTag = (html: string, src: string) =>
  (html.match(/<img[^>]*>/g) ?? []).find((t) => t.includes(`src="${src}"`)) ?? '';

// test-only: bentuk minimal data
const sosmed = (id: string, image: string | null, icon: string | null = null) =>
  ({ id, name: `Akun ${id}`, icon, iconUrl: `https://example.com/${id}`, image: image ? { link: image } : null }) as unknown as SosmedItem;
const program = (id: string, link: string) =>
  ({ id, name: `Program ${id}`, image: { link } }) as unknown as ProgramInovasiItem;

describe('HeroSosmed: ikon 22px', () => {
  it('unggahan /api/img → srcset 48/72 dan sizes 22px, tetap lazy', () => {
    const src = '/api/img/ikon-a-mobile.webp';
    const tag = imgTag(render(<HeroSosmed data={[sosmed('a', src)]} />), src);
    expect(tag).toContain(`srcSet="${src}?size=48 48w, ${src}?size=72 72w"`);
    expect(tag).toContain('sizes="22px"');
    expect(tag).toContain('loading="lazy"');
  });

  it('ikon bawaan (aset statis, bukan /api/img) tetap apa adanya tanpa srcset', () => {
    const tag = imgTag(render(<HeroSosmed data={[sosmed('b', null, 'facebook')]} />), '/assets/images/sosmed/facebook.png');
    expect(tag).not.toBe('');
    expect(tag).not.toContain('srcSet');
    expect(tag).not.toContain('sizes=');
  });
});

describe('HeroPrograms: logo dalam kotak tinggi 72px', () => {
  it('unggahan /api/img → srcset 240/480 dan sizes mengikuti lebar kotak per breakpoint', () => {
    const src = '/api/img/logo-a-mobile.webp';
    const html = render(<HeroPrograms items={[program('a', src)]} loading={false} onOpen={vi.fn()} />);
    const tag = imgTag(html, src);
    expect(tag).toContain(`srcSet="${src}?size=240 240w, ${src}?size=480 480w"`);
    expect(tag).toContain('sizes="(max-width: 734px) 112px, (max-width: 1068px) calc(24vw - 50px), calc(14vw - 58px)"');
    expect(tag).toContain('loading="lazy"');
  });

  it('URL eksternal atau sudah ber-query tetap apa adanya tanpa srcset', () => {
    const external = 'https://cdn.example.com/logo.png';
    const queried = '/api/img/logo-b-mobile.webp?size=300';
    const html = render(
      <HeroPrograms items={[program('x', external), program('y', queried)]} loading={false} onOpen={vi.fn()} />,
    );
    for (const src of [external, queried]) {
      const tag = imgTag(html, src);
      expect(tag).not.toBe('');
      expect(tag).not.toContain('srcSet');
      expect(tag).not.toContain('sizes=');
    }
  });
});

describe('hero-image.meta selaras dengan CSS', () => {
  const dir = path.resolve(__dirname, '../../src/app/(public)/_com/main-page/landing-page');
  const landingCss = readFileSync(path.join(dir, 'landing.module.css'), 'utf8');
  const programsCss = readFileSync(path.join(dir, 'programs.module.css'), 'utf8');

  it('ikon sosmed tetap 22px (dasar sizes="22px")', () => {
    expect(landingCss).toMatch(/\.sosmedLink \.sosmedIcon \{\s*width: 22px;\s*height: 22px;/);
  });

  it('kotak logo 72px dan ubin ponsel 132px (padding 10px → kotak 112px, dasar sizes ponsel)', () => {
    expect(programsCss).toMatch(/\.tile \.tileLogo,\s*\.tileInitials \{[^}]*height: 72px;/);
    expect(programsCss).toMatch(/padding: 14px 10px 12px;/);
    expect(programsCss).toMatch(/flex-basis: 132px;/);
  });
});
