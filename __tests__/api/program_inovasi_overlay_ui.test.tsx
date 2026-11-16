// @vitest-environment node
// Overlay detail Program Inovasi: markup tiap keadaan (preview, kerangka, galat, tidak ditemukan, detail +
// galeri) dan tampilan besar foto. jsdom rusak di repo ini, jadi renderToStaticMarkup; DOMPurify di-stub,
// hook muat detail di-mock agar keadaan bisa dipilih tanpa fetch. Interaksi (klik/Esc/geser) dicek manual.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, ModalRoot } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DetailState, ProgramInovasiDetail } from '@/app/(public)/_com/main-page/landing-page/program-overlay/program-overlay.logic';

const sanitize = vi.hoisted(() => vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')));
vi.mock('dompurify', () => ({ default: { sanitize } }));
const detailState = vi.hoisted(() => ({ current: null as DetailState | null }));
vi.mock('@/app/(public)/_com/main-page/landing-page/program-overlay/use-program-detail', () => ({
  useProgramDetail: () => detailState.current,
}));

import type { ProgramInovasiItem } from '@/app/(public)/_com/main-page/landing-page/HeroPrograms';
import { ProgramInovasiOverlay } from '@/app/(public)/_com/main-page/landing-page/program-overlay/ProgramInovasiOverlay';
import { ProgramOverlayPhoto } from '@/app/(public)/_com/main-page/landing-page/program-overlay/ProgramOverlayPhoto';
import { PROGRAM_OVERLAY_TEXT as T } from '@/app/(public)/_com/main-page/landing-page/program-overlay/program-overlay.text';

// test-only: berkas & program fiktif berbentuk respons API.
const file = (id: string, link: string) => ({
  id, name: id, realName: id, path: id, mimeType: 'image/webp', size: 1,
  createdAt: new Date(0), updatedAt: new Date(0), deletedAt: null, isActive: true, link, category: 'image',
});
const base = {
  id: 'p1', name: 'GALAH MELAH', description: '<p>Gerakan <strong>sadar</strong> sampah.</p><script>alert(1)</script>',
  imageId: 'logo', link: '-', createdAt: new Date(0), updatedAt: new Date(0), deletedAt: null, isActive: true,
};
const preview = (count?: number) =>
  ({ ...base, image: file('logo', '/api/img/logo'), ...(count === undefined ? {} : { _count: { images: count } }) }) as ProgramInovasiItem;
const detail: ProgramInovasiDetail = {
  ...base,
  image: file('logo', '/api/img/logo'),
  images: [file('a', '/api/img/a'), file('b', '/api/img/b'), file('c', '/api/img/c')],
};

const theme = { components: { ModalRoot: ModalRoot.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const overlay = (props: { programId?: string | null; preview?: ProgramInovasiItem } = {}) =>
  render(<ProgramInovasiOverlay programId={props.programId === undefined ? 'p1' : props.programId} preview={props.preview} onClose={() => {}} />);

beforeEach(() => {
  sanitize.mockClear();
  detailState.current = null;
});

describe('ProgramInovasiOverlay', () => {
  it('programId null → tidak ada dialog', () => {
    expect(overlay({ programId: null, preview: preview(2) })).not.toContain('role="dialog"');
  });

  it('preview saat memuat: dialog bernama judul, logo, label, deskripsi tersanitasi, galeri kerangka sebanyak _count', () => {
    const html = overlay({ preview: preview(2) });
    expect(html).toContain('role="dialog"');
    // Mantine memasang aria-labelledby lewat effect (titleMounted), jadi tak ada di SSR: cek h2 = Modal.Title dialog ini.
    const rootTag = html.match(/<div[^>]*mantine-Modal-root[^>]*>/)?.[0] ?? '';
    const rootId = rootTag.match(/\sid="([^"]+)"/)?.[1];
    expect(rootId).toBeTruthy();
    expect(html).toMatch(new RegExp(`<h2[^>]*id="${rootId}-title"[^>]*>GALAH MELAH</h2>`));
    expect(html).not.toMatch(/<section[^>]*role="dialog"[^>]*aria-label=/);
    expect(html).toContain(`>${T.eyebrow}<`);
    expect(html).toContain('src="/api/img/logo"');
    expect(html).toContain(`aria-label="${T.close}"`);
    expect(sanitize).toHaveBeenCalled();
    expect(html).toContain('<p>Gerakan <strong>sadar</strong> sampah.</p>');
    expect(html).not.toContain('<script');
    expect(html).toMatch(new RegExp(`<h3[^>]*>${T.galleryTitle}</h3>`));
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/thumbSkeleton/g)).toHaveLength(2);
    expect(html).toMatch(/--overlay-filter:\s*blur\(/);
  });

  it('preview dengan _count 0 → tanpa bagian Dokumentasi sama sekali', () => {
    expect(overlay({ preview: preview(0) })).not.toContain(T.galleryTitle);
  });

  it('tautan langsung tanpa preview → kerangka aria-busy, tanpa judul, dialog tetap bernama', () => {
    const html = overlay();
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(T.loading);
    expect(html).not.toMatch(/<h2/);
    expect(html).toContain(`aria-label="${T.eyebrow}"`);
  });

  it('galat/tidak ditemukan tanpa preview → satu kalimat di kotak', () => {
    detailState.current = { id: 'p1', status: 'error' };
    expect(overlay()).toMatch(new RegExp(`<p class="[^"]*notice[^"]*">${T.unavailable}</p>`));
    detailState.current = { id: 'p1', status: 'ready', data: null };
    expect(overlay({ preview: preview(2) })).toContain(T.unavailable);
  });

  it('galat dengan preview: detail tetap; kotak galat galeri hanya bila _count > 0', () => {
    detailState.current = { id: 'p1', status: 'error' };
    const withPhotos = overlay({ preview: preview(3) });
    expect(withPhotos).toMatch(/<h2[^>]*>GALAH MELAH<\/h2>/);
    expect(withPhotos).toContain(T.galleryError);
    const unknown = overlay({ preview: preview() });
    expect(unknown).not.toContain(T.galleryError);
    expect(unknown).not.toContain(T.galleryTitle);
  });

  it('detail siap: grid foto berupa tombol berlabel + indeks, foto lazy', () => {
    detailState.current = { id: 'p1', status: 'ready', data: detail };
    const html = overlay({ preview: preview(3) });
    expect(html.match(/data-photo-index=/g)).toHaveLength(3);
    expect(html).toContain(`aria-label="${T.openPhoto(2, 3)}"`);
    expect(html).toContain('src="/api/img/c"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('thumbSkeleton');
  });

  it('deskripsi kosong → kalimat pengganti, tanpa logo → ubin logo tidak dirender', () => {
    detailState.current = { id: 'p1', status: 'ready', data: { ...detail, description: '<p></p>', image: null, images: [] } };
    const html = overlay();
    expect(html).toContain(T.emptyDescription);
    expect(html).not.toContain('logoTile');
    expect(html).not.toContain(T.galleryTitle);
  });
});

describe('ProgramOverlayPhoto', () => {
  const photos = [{ key: 'a', link: '/api/img/a' }, { key: 'b', link: '/api/img/b' }, { key: 'c', link: '/api/img/c' }];
  const photo = (index: number, list = photos) =>
    render(<ProgramOverlayPhoto photos={list} index={index} name="ANAK EMAS" onBack={() => {}} onStep={() => {}} />);

  it('kembali, penghitung, foto ber-alt, tombol ujung aria-disabled (bukan disabled)', () => {
    const html = photo(0);
    expect(html).toContain(`aria-label="${T.photoView('ANAK EMAS')}"`);
    expect(html).toMatch(new RegExp(`<button[^>]*>.*${T.back}</button>`));
    expect(html).toContain(`>${T.counter(1, 3)}<`);
    expect(html).toContain(`alt="${T.photoAlt('ANAK EMAS', 1)}"`);
    expect(html).toMatch(new RegExp(`aria-label="${T.prevPhoto}" aria-disabled="true"`));
    expect(html).not.toMatch(new RegExp(`aria-label="${T.nextPhoto}" aria-disabled`));
    expect(html).not.toContain('disabled=""');
  });

  it('foto terakhir: berikutnya aria-disabled; satu foto: tanpa tombol navigasi', () => {
    expect(photo(2)).toMatch(new RegExp(`aria-label="${T.nextPhoto}" aria-disabled="true"`));
    const single = photo(0, photos.slice(0, 1));
    expect(single).not.toContain(T.prevPhoto);
    expect(single).not.toContain(T.nextPhoto);
  });
});
