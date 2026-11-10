// @vitest-environment node
// Admin DAK: "Salin ke program lain…" di editor — klien API (URL/method/body, pesan error), helper murni
// (program saat ini dikecualikan, dokumen belum tersimpan dilewati), render modal & tombol toolbar.
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DokumenBulkActions } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenBulkActions';
import { DokumenSelectionToolbar } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenSelectionToolbar';
import {
  SalinKeProgramForm,
  SalinKeProgramModal,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/SalinKeProgramModal';
import type { DokumenDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft';
import type { IsiDraft } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/folder-draft';
import {
  fetchFolderTujuan,
  fetchProgramTujuan,
  pesanGagalApi,
  PROGRAM_TUJUAN_LIMIT,
  salinKeProgram,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/salin-api';
import {
  folderTujuanOptions,
  pisahDokumenSalin,
  programTujuanOptions,
  salinBlockedReason,
  salinPayload,
  salinProgramNotice,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/salin-program';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();
const noop = () => {};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fetchReturning = (status: number, body: unknown) => vi.fn(async () => jsonResponse(status, body)) as unknown as typeof fetch & {
  mock: { calls: [string, RequestInit | undefined][] };
};

// test-only fixtures
const tersimpan = (key: string): DokumenDraft => ({ key, id: key, folderKey: null, fileId: `f-${key}`, judul: key });
const baru = (key: string): DokumenDraft => ({ key, folderKey: null, judul: key, file: new File(['x'], `${key}.pdf`) });

describe('salin-api', () => {
  it('salinKeProgram: POST JSON ke /dokumen/salin-ke-program → { copied, skipped }', async () => {
    const fetchImpl = fetchReturning(200, { success: true, data: { copied: 2, skipped: 1 } });
    const input = { dokumenIds: ['d1', 'd2', 'd3'], targetProgramId: 'p2', targetFolderId: null };
    expect(await salinKeProgram(input, fetchImpl)).toEqual({ ok: true, data: { copied: 2, skipped: 1 } });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/landingpage/desaantikorupsi/dokumen/salin-ke-program');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(String(init?.body))).toEqual(input);
  });

  it('salinKeProgram: 409/400 → pesan server; tanpa pesan → fallback + status; jaringan putus → pesan koneksi', async () => {
    const pesan = 'Program tujuan akan melebihi 100 dokumen (batas maksimal)';
    const input = { dokumenIds: ['d1'], targetProgramId: 'p2', targetFolderId: 'fx' };
    expect(await salinKeProgram(input, fetchReturning(409, { success: false, message: pesan }))).toEqual({ ok: false, message: pesan });
    expect(await salinKeProgram(input, fetchReturning(500, null))).toEqual({ ok: false, message: 'Gagal menyalin dokumen (HTTP 500)' });
    const putus = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    expect(await salinKeProgram(input, putus)).toEqual({
      ok: false,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.',
    });
  });

  it('fetchProgramTujuan: GET findMany berpaginasi, hanya id & name', async () => {
    const fetchImpl = fetchReturning(200, {
      success: true,
      data: [{ id: 'p1', name: 'Program A', jumlahDokumen: 3 }, { id: 'p2', name: 'Program B' }, { bukan: 'program' }],
    });
    expect(await fetchProgramTujuan(fetchImpl)).toEqual({
      ok: true,
      data: [
        { id: 'p1', name: 'Program A' },
        { id: 'p2', name: 'Program B' },
      ],
    });
    expect(fetchImpl.mock.calls[0][0]).toBe(`/api/landingpage/desaantikorupsi/findMany?page=1&limit=${PROGRAM_TUJUAN_LIMIT}`);
  });

  it('fetchProgramTujuan: success false (200) → gagal dengan pesan server', async () => {
    expect(await fetchProgramTujuan(fetchReturning(200, { success: false, message: 'Failed fetch' }))).toEqual({
      ok: false,
      message: 'Failed fetch',
    });
  });

  it('fetchFolderTujuan: GET /:id (id di-encode) → folder berurutan', async () => {
    const fetchImpl = fetchReturning(200, {
      success: true,
      data: { folders: [{ id: 'fa', nama: 'Laporan', dokumen: [] }], dokumenUmum: [] },
    });
    expect(await fetchFolderTujuan('p 2', fetchImpl)).toEqual({ ok: true, data: [{ id: 'fa', nama: 'Laporan' }] });
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/landingpage/desaantikorupsi/p%202');
    expect(await fetchFolderTujuan('x', fetchReturning(404, { success: false, message: 'Tidak ditemukan' }))).toEqual({
      ok: false,
      message: 'Tidak ditemukan',
    });
  });

  it('pesanGagalApi: utamakan message server', () => {
    expect(pesanGagalApi(403, { message: 'Akses ditolak' }, 'Gagal')).toBe('Akses ditolak');
    expect(pesanGagalApi(502, { message: '  ' }, 'Gagal')).toBe('Gagal (HTTP 502)');
  });
});

describe('salin-program helpers', () => {
  it('programTujuanOptions mengecualikan program saat ini', () => {
    const programs = [
      { id: 'p1', name: 'Program A' },
      { id: 'p2', name: 'Program B' },
    ];
    expect(programTujuanOptions(programs, 'p1')).toEqual([{ value: 'p2', label: 'Program B' }]);
  });

  it('folderTujuanOptions: folder program tujuan + "Umum" di akhir', () => {
    expect(folderTujuanOptions([{ id: 'fa', nama: 'Laporan' }])).toEqual([
      { value: 'fa', label: 'Laporan' },
      { value: 'umum', label: 'Umum' },
    ]);
  });

  it('pisahDokumenSalin: hanya id tersimpan (unik, urut draft); draft baru dihitung dilewati', () => {
    expect(pisahDokumenSalin([tersimpan('d2'), baru('n1'), tersimpan('d1'), baru('n2')])).toEqual({
      dokumenIds: ['d2', 'd1'],
      belumTersimpan: 2,
    });
  });

  it('salinPayload: "Umum" → targetFolderId null; salinBlockedReason', () => {
    expect(salinPayload(['d1'], 'p2', 'umum')).toEqual({ dokumenIds: ['d1'], targetProgramId: 'p2', targetFolderId: null });
    expect(salinPayload(['d1'], 'p2', 'fa').targetFolderId).toBe('fa');
    expect(salinBlockedReason([], 'p2')).toMatch(/Tidak ada dokumen tersimpan/);
    expect(salinBlockedReason(['d1'], null)).toBe('Pilih program tujuan.');
    expect(salinBlockedReason(Array.from({ length: 51 }, (_, i) => `d${i}`), 'p2')).toBe('Maksimal 50 dokumen per salin.');
    expect(salinBlockedReason(['d1'], 'p2')).toBeNull();
  });

  it('salinProgramNotice: copied/skipped', () => {
    expect(salinProgramNotice({ copied: 2, skipped: 1 }, 'Program B')).toEqual({
      message: '2 dokumen disalin ke "Program B", 1 dilewati karena sudah ada di folder tujuan',
      tone: 'success',
    });
    expect(salinProgramNotice({ copied: 0, skipped: 2 }, 'Program B').tone).toBe('info');
  });
});

describe('Render — modal & toolbar', () => {
  const formProps = {
    programOptions: programTujuanOptions(
      [
        { id: 'p1', name: 'Program Saat Ini' },
        { id: 'p2', name: 'Program Tujuan' },
      ],
      'p1',
    ),
    programValue: 'p2',
    onProgramChange: noop,
    folderOptions: folderTujuanOptions([{ id: 'fa', nama: 'Laporan' }]),
    folderValue: 'umum',
    onFolderChange: noop,
    savedCount: 2,
    unsavedCount: 1,
    blockedReason: null,
    error: null,
    saving: false,
    onSubmit: noop,
    onCancel: noop,
  };

  it('form: penjelasan langsung tersimpan, jumlah tersimpan & "N dokumen baru belum disimpan dilewati"', () => {
    const html = render(<SalinKeProgramForm {...formProps} />);
    expect(html).toContain('Salinan langsung tersimpan di program tujuan dan tidak mengubah draft program ini');
    expect(html).toContain('2 dokumen tersimpan akan disalin.');
    expect(html).toContain('1 dokumen baru belum disimpan dilewati.');
    expect(html).toContain('value="Program Tujuan"'); // program terpilih
    expect(html).toContain('Folder tujuan');
    expect(html).not.toContain('Program Saat Ini'); // program saat ini tidak jadi pilihan
  });

  it('form: tanpa dokumen baru → tidak ada info dilewati; tombol Salin nonaktif bila diblokir', () => {
    const html = render(<SalinKeProgramForm {...formProps} unsavedCount={0} blockedReason="Pilih program tujuan." programValue={null} />);
    expect(html).not.toContain('data-salin-info="dilewati"');
    expect(html).toContain('Pilih program tujuan.');
    expect(html.match(/<button[^>]*>(?:(?!<\/button>)[\s\S])*Salin<\/span>/)?.[0]).toMatch(/disabled=""/);
  });

  it('modal terbuka: judul, memuat program, info dokumen baru dilewati', () => {
    const html = render(
      <SalinKeProgramModal opened programId="p1" dokumen={[tersimpan('d1'), baru('n1')]} onClose={noop} />,
    );
    expect(html).toContain('Salin 2 dokumen ke program lain');
    expect(html).toContain('Memuat daftar program…');
    expect(html).toContain('1 dokumen tersimpan akan disalin.');
    expect(html).toContain('1 dokumen baru belum disimpan dilewati.');
  });

  it('toolbar: tombol "Salin ke program lain…" hanya bila onCopyToProgram disediakan', () => {
    const props = { count: 2, onMove: noop, onCopy: noop, onDelete: noop, onClear: noop };
    expect(render(<DokumenSelectionToolbar {...props} />)).not.toContain('Salin ke program lain…');
    const html = render(<DokumenSelectionToolbar {...props} onCopyToProgram={noop} />);
    expect(html).toContain('>Salin ke program lain…<');
    expect(html).toContain('aria-label="Salin ke program lain…"');
  });

  it('DokumenBulkActions: tombol muncul hanya dengan programId (halaman edit), modal tertutup', () => {
    const isi: IsiDraft = { folders: [], dokumen: [tersimpan('d1')] };
    const base = { value: isi, selection: new Set(['d1']), onChange: noop, onSelectionChange: noop };
    expect(render(<DokumenBulkActions {...base} />)).not.toContain('Salin ke program lain…');
    const html = render(<DokumenBulkActions {...base} programId="p1" />);
    expect(html).toContain('Salin ke program lain…');
    expect(html).not.toContain('Memuat daftar program…');
  });
});
