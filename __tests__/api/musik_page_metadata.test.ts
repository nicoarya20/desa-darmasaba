// @vitest-environment node
// Judul tab & canonical per menu Musik Desa (page.tsx server mengekspor metadata dari musik-page.meta.ts).
import { describe, expect, it, vi } from 'vitest';

// Halaman merender komponen client pustaka; yang diuji di sini hanya ekspor metadata-nya.
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikHome', () => ({ MusikHome: () => null }));
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikJelajahi', () => ({ MusikJelajahi: () => null }));
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikPlaylist', () => ({ MusikPlaylist: () => null }));

import { metadata as musikMeta } from '@/app/(public)/(pages)/musik/musik-desa/page';
import { metadata as jelajahiMeta } from '@/app/(public)/(pages)/musik/musik-desa/jelajahi/page';
import { metadata as playlistMeta } from '@/app/(public)/(pages)/musik/musik-desa/playlist/page';
import { metadata as rootMeta } from '@/app/layout';

describe('metadata halaman Musik Desa', () => {
  it('judul per rute; sufiks situs dari template root layout', () => {
    expect(musikMeta.title).toBe('Musik Desa');
    expect(jelajahiMeta.title).toBe('Jelajahi · Musik Desa');
    expect(playlistMeta.title).toBe('Playlist · Musik Desa');
    expect(rootMeta.title).toMatchObject({ template: '%s | Desa Darmasaba' });
  });

  it('Jelajahi canonical ke /jelajahi tanpa query (?q / ?genre / ?artis tidak terindeks terpisah)', () => {
    expect(jelajahiMeta.alternates?.canonical).toBe('/musik/musik-desa/jelajahi');
  });
});
