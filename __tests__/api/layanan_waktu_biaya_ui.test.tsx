// @vitest-environment node
// UI estimasi waktu & biaya pelayanan: badge publik + payload state admin.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import suratKeterangan from '@/app/admin/(dashboard)/_state/desa/layananDesa/surat-keterangan';
import pelayananTelunjukSaktiDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa/telunjuk-sakti-desa';

const render = (props: { estimasiWaktu?: string | null; biaya?: number | null }) =>
  renderToStaticMarkup(
    <MantineProvider>
      <LayananWaktuBiayaBadge {...props} />
    </MantineProvider>,
  );

// MantineProvider sendiri merender <style> variabel tema; yang dicek hanya badge-nya.
const hasBadge = (html: string) => html.includes('mantine-Badge-root');

describe('LayananWaktuBiayaBadge', () => {
  it('waktu + biaya 0 → "1 hari kerja • Gratis"', () => {
    const html = render({ estimasiWaktu: '1 hari kerja', biaya: 0 });
    expect(hasBadge(html)).toBe(true);
    expect(html).toContain('1 hari kerja • Gratis');
  });

  it('hanya biaya berbayar → "Rp 50.000"', () => {
    const html = render({ estimasiWaktu: null, biaya: 50000 });
    expect(html).toContain('Rp 50.000');
    expect(html).not.toContain('Gratis');
  });

  it('biaya 0 saja tetap tampil sebagai "Gratis" (0 ≠ belum diisi)', () => {
    const html = render({ estimasiWaktu: null, biaya: 0 });
    expect(hasBadge(html)).toBe(true);
    expect(html).toContain('Gratis');
  });

  it('kedua field null/kosong → badge tidak dirender', () => {
    expect(hasBadge(render({ estimasiWaktu: null, biaya: null }))).toBe(false);
    expect(hasBadge(render({}))).toBe(false);
    expect(hasBadge(render({ estimasiWaktu: '   ', biaya: null }))).toBe(false);
  });
});

describe('state admin — payload create/update', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);
    suratKeterangan.findMany.load = vi.fn();
    pelayananTelunjukSaktiDesa.findMany.load = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const putBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it('surat keterangan: input "0" dikirim sebagai angka 0, bukan null', async () => {
    suratKeterangan.edit.id = 'row-1';
    suratKeterangan.edit.form = {
      name: 'Surat Usaha',
      deskripsi: 'Isi deskripsi',
      imageId: 'img-1',
      image2Id: 'img-2',
      estimasiWaktu: ' 1 hari kerja ',
      biaya: '0',
    };
    await suratKeterangan.edit.update();
    expect(putBody()).toMatchObject({ estimasiWaktu: '1 hari kerja', biaya: 0 });
  });

  it('surat keterangan: input kosong dikirim sebagai null (dikosongkan)', async () => {
    suratKeterangan.edit.id = 'row-1';
    suratKeterangan.edit.form = {
      name: 'Surat Usaha',
      deskripsi: 'Isi deskripsi',
      imageId: 'img-1',
      image2Id: 'img-2',
      estimasiWaktu: '',
      biaya: '',
    };
    await suratKeterangan.edit.update();
    const body = putBody();
    expect(body.estimasiWaktu).toBeNull();
    expect(body.biaya).toBeNull();
  });

  it('surat keterangan: biaya di atas batas ditolak di klien, request tidak dikirim', async () => {
    suratKeterangan.edit.id = 'row-1';
    suratKeterangan.edit.form = {
      name: 'Surat Usaha',
      deskripsi: 'Isi deskripsi',
      imageId: 'img-1',
      image2Id: 'img-2',
      estimasiWaktu: '',
      biaya: '999999999',
    };
    await suratKeterangan.edit.update();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('telunjuk sakti desa: payload update memuat waktu & biaya', async () => {
    pelayananTelunjukSaktiDesa.edit.id = 'row-2';
    pelayananTelunjukSaktiDesa.edit.form = {
      name: 'Akta Kelahiran',
      deskripsi: 'Akta',
      link: 'https://contoh.test/akta',
      estimasiWaktu: '5 hari kerja',
      biaya: '15000',
    };
    await pelayananTelunjukSaktiDesa.edit.update();
    expect(putBody()).toMatchObject({ estimasiWaktu: '5 hari kerja', biaya: 15000 });
  });
});
