// @vitest-environment node
// Detail admin Laporan Publik: kronologi & penanganan dari kiriman publik wajib lewat sanitizeRichText sebelum
// dirender (BACKEND-TODO P1: XSS tersimpan). DOMPurify butuh DOM dan jsdom tak bisa dimuat di Node ini, jadi
// diganti stub yang mencatat input/opsi; konfigurasi allowlist-nya sendiri dikunci di rich_text.test.ts.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { RICH_TEXT_TAGS } from '@/lib/rich-text';

// Stub: kembalikan penanda "aman" (atau kosong untuk isi yang seluruhnya skrip), tak pernah HTML mentah.
const sanitize = vi.hoisted(() =>
  vi.fn((html: string) => (/^<script>[^<]*<\/script>$/.test(html) ? '' : `<p>aman:${html.length}</p>`)),
);
vi.mock('dompurify', () => ({ default: { sanitize } }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'lap-1' }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/app/admin/(dashboard)/_state/keamanan/laporan-publik', async () => {
  const { proxy } = await import('valtio');
  return {
    default: proxy({
      findUnique: { data: null as unknown, load: vi.fn() },
      delete: { loading: false, byId: vi.fn() },
    }),
  };
});

import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import DetailLaporanPublik from '@/app/admin/(dashboard)/keamanan/laporan-publik/[id]/page';

const render = () =>
  renderToStaticMarkup(
    <MantineProvider env="test">
      <DetailLaporanPublik />
    </MantineProvider>,
  ).replace(/<style[\s\S]*?<\/style>/g, '');

const setLaporan = (kronologi: string | null, penanganan: string[]) => {
  (laporanPublikState.findUnique as { data: unknown }).data = {
    id: 'lap-1',
    judul: 'Sampah berserakan',
    lokasi: 'Banjar Tengah',
    tanggalWaktu: '2026-11-05T02:00:00.000Z',
    status: 'Proses',
    kronologi,
    penanganan: penanganan.map((deskripsi, i) => ({ id: `p-${i}`, laporanId: 'lap-1', deskripsi })),
  };
};

const KRONOLOGI = '<p>Ada sampah</p><img src=x onerror="alert(1)"><script>alert(2)</script>';
const PENANGANAN = '<p onclick="steal()">Ditangani</p><a href="javascript:alert(1)">klik</a>';
const OPSI = { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: [] };

beforeEach(() => {
  sanitize.mockClear();
  setLaporan(null, []);
});

describe('Detail admin Laporan Publik: sanitasi HTML kiriman publik', () => {
  it('kronologi & tiap penanganan lewat DOMPurify dengan allowlist tag, tanpa atribut', () => {
    setLaporan(KRONOLOGI, [PENANGANAN]);
    render();
    expect(sanitize).toHaveBeenCalledWith(KRONOLOGI, OPSI);
    expect(sanitize).toHaveBeenCalledWith(PENANGANAN, OPSI);
  });

  it('HTML mentah tidak pernah sampai ke markup, hanya hasil sanitasi', () => {
    setLaporan(KRONOLOGI, [PENANGANAN]);
    const html = render();
    expect(html).toContain(`<p>aman:${KRONOLOGI.length}</p>`);
    expect(html).toContain(`<p>aman:${PENANGANAN.length}</p>`);
    expect(html).not.toMatch(/onerror|onclick|<script|javascript:/i);
  });

  it('penanganan yang isinya habis tersanitasi tampil sebagai "-"', () => {
    setLaporan('<p>x</p>', ['<script>alert(1)</script>']);
    expect(render()).toMatch(/>-<\/p>/);
  });
});
