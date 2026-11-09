// @vitest-environment node
// Admin DAK: kolom info baris draft — ukuran (tersimpan / File.size), tanggal unggah tersimpan, label "Baru",
// dan ukuran/createdAt ikut terbawa dari detail program (isiDraftFromDetail).
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenDraftRow } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenDraftRow';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import {
  draftInfo,
  draftTanggal,
  draftUkuran,
  formatTanggalUnggah,
  isDraftBaru,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/draft-info';
import { isiDraftFromDetail } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

// test-only fixtures
const tersimpan: DokumenDraft = {
  key: 'd1',
  id: 'd1',
  folderKey: null,
  fileId: 'f1',
  judul: 'APBDes 2025',
  realName: 'apbdes.pdf',
  mimeType: 'application/pdf',
  size: 3 * 1024 * 1024 + 400 * 1024,
  createdAt: '2026-11-08T20:00:00.000Z', // 9 Nov 2026 04.00 WITA
};
const berkasBaru = new File([new Uint8Array(2048)], 'baru.pdf', { type: 'application/pdf' });
const baru: DokumenDraft = { key: 'n1', folderKey: null, judul: 'Baru', file: berkasBaru, realName: 'baru.pdf' };

const row = (draft: DokumenDraft) =>
  render(
    <DokumenDraftRow
      draft={draft}
      index={0}
      total={1}
      folderOptions={[{ value: 'umum', label: 'Umum' }]}
      folderValue="umum"
      selected={false}
      onToggleSelect={vi.fn()}
      onJudul={vi.fn()}
      onFolder={vi.fn()}
      onMove={vi.fn()}
      onPreview={vi.fn()}
      onRemove={vi.fn()}
    />,
  );
// Teks pertama setelah elemen ber-data-info (Badge membungkus label dalam <span>).
const infoOf = (html: string, kind: string) =>
  html.match(new RegExp(`data-info="${kind}"[^>]*>(?:<[^>]+>)*([^<]+)<`))?.[1] ?? null;

describe('draft-info helpers', () => {
  it('draftUkuran: size tersimpan, File.size untuk yang belum diunggah, null bila tak diketahui', () => {
    expect(draftUkuran(tersimpan)).toBe(tersimpan.size);
    expect(draftUkuran(baru)).toBe(2048);
    expect(draftUkuran({ size: null })).toBeNull();
    expect(draftUkuran({})).toBeNull();
  });

  it('isDraftBaru & draftTanggal: tanpa id = baru (tanggal = now), salinan tanpa id juga baru', () => {
    const now = new Date('2026-11-09T10:00:00.000Z');
    expect(isDraftBaru(tersimpan)).toBe(false);
    expect(isDraftBaru(baru)).toBe(true);
    expect(draftTanggal(tersimpan, now)).toBe(tersimpan.createdAt);
    expect(draftTanggal(baru, now)).toBe(now.toISOString());
    // Salinan dokumen tersimpan membawa createdAt asal tapi belum punya id → tetap dianggap baru.
    expect(draftTanggal({ createdAt: tersimpan.createdAt }, now)).toBe(now.toISOString());
  });

  it('formatTanggalUnggah: format id-ID di zona waktu desa (WITA); kosong/rusak → "—"', () => {
    expect(formatTanggalUnggah(tersimpan.createdAt)).toBe('9 Nov 2026');
    expect(formatTanggalUnggah(undefined)).toBe('—');
    expect(formatTanggalUnggah('bukan-tanggal')).toBe('—');
  });

  it('draftInfo: ukuran ramah baca + tanggal atau label "Baru"', () => {
    expect(draftInfo(tersimpan)).toEqual({ ukuran: '3,4 MB', tanggal: '9 Nov 2026', baru: false });
    expect(draftInfo(baru)).toEqual({ ukuran: '2 KB', tanggal: 'Baru', baru: true });
  });
});

describe('DokumenDraftRow — kolom info', () => {
  it('dokumen tersimpan: ukuran & tanggal unggah, tanpa label "Baru"', () => {
    const html = row(tersimpan);
    expect(infoOf(html, 'ukuran')).toBe('3,4 MB');
    expect(infoOf(html, 'tanggal')).toBe('9 Nov 2026');
    expect(html).not.toContain('Belum diunggah');
  });

  it('dokumen belum diunggah: ukuran dari File.size + label "Baru" + "Belum diunggah"', () => {
    const html = row(baru);
    expect(infoOf(html, 'ukuran')).toBe('2 KB');
    expect(infoOf(html, 'tanggal')).toBe('Baru');
    expect(html).toContain('Belum diunggah');
  });

  it('ukuran tak diketahui → "—"', () => {
    expect(infoOf(row({ ...tersimpan, size: null }), 'ukuran')).toBe('—');
  });
});

describe('isiDraftFromDetail membawa size & createdAt', () => {
  it('draft folder & Umum menyimpan ukuran dan tanggal unggah dari detail', () => {
    const dok = (id: string, size: number | null) => ({
      id,
      judul: id,
      urutan: 0,
      fileId: `f-${id}`,
      createdAt: '2026-11-01T00:00:00.000Z',
      file: { id: `f-${id}`, link: `/l/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf', size },
    });
    const isi = isiDraftFromDetail({
      folders: [{ id: 'fa', nama: 'A', urutan: 0, dokumen: [dok('a1', 10)] }],
      dokumenUmum: [dok('u1', null)],
    });
    expect(isi.dokumen.map((d) => [d.key, d.size, d.createdAt])).toEqual([
      ['a1', 10, '2026-11-01T00:00:00.000Z'],
      ['u1', null, '2026-11-01T00:00:00.000Z'],
    ]);
  });
});
