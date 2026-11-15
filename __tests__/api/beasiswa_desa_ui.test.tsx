// @vitest-environment node
// Halaman Beasiswa Desa + modal pendaftaran + alihan alamat lama. jsdom rusak di repo ini → markup via
// renderToStaticMarkup (efek tidak jalan; interaksi diverifikasi manual di browser).
import { MantineProvider, Modal } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
const redirect = vi.fn();
vi.mock('next/navigation', () => ({ permanentRedirect: (url: string) => redirect(url) }));

import { BeasiswaPage, BeasiswaPageBody } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/BeasiswaPage';
import { BEASISWA_TEXT as T } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.text';
import type { Keunggulan, Ringkasan } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.logic';
import { SUBMIT_ERROR } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.logic';
import { BeasiswaFormContent } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/form/BeasiswaFormContent';
import { BEASISWA_FORM_TEXT as F } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/form/beasiswa-form.text';
import type { BeasiswaFormApi } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/form/use-beasiswa-form';
import { EMPTY_BEASISWA_FORM } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_lib/beasiswaForm';
import PelajariLebihLanjutPage from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/pelajari-lebih-lanjut/page';

const theme = { components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: 5 keunggulan (data stg 2026-11) + ringkasan.
const keunggulan: Keunggulan[] = Array.from({ length: 5 }, (_, i) => ({ id: `k${i}`, judul: `Program ${i + 1}`, deskripsi: `Deskripsi ${i + 1}` }));
const ringkasan: Ringkasan = { pendaftar: 45, danaRingkas: 'Rp 1,2 M', danaPenuh: 'Rp 1.200.000.000', tahunAjaran: '2025/2026' };
const noop = () => {};
const body = (over: Partial<Parameters<typeof BeasiswaPageBody>[0]> = {}) =>
  render(
    <BeasiswaPageBody
      keunggulan={{ status: 'ready', data: keunggulan }}
      ringkasan={{ status: 'ready', data: ringkasan }}
      onRetryKeunggulan={noop}
      onRetryRingkasan={noop}
      onDaftar={noop}
      {...over}
    />,
  );

describe('BeasiswaPageBody', () => {
  it('satu h1, angka jujur (Pendaftar, Rp ringkas + penuh, tahun ajaran), tanpa 90%', () => {
    const html = body();
    expect(count(html, '<h1')).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Beasiswa Desa<\/h1>/);
    for (const text of [T.pendaftar, '>45<', 'Rp 1,2 M', 'Rp 1.200.000.000', '2025/2026']) expect(html).toContain(text);
    expect(html).not.toContain('90%');
    expect(html).not.toContain('Penerima Beasiswa');
  });

  it('semua keunggulan tampil sekaligus, tanpa paginasi', () => {
    const html = body();
    for (const k of keunggulan) expect(html).toContain(`>${k.judul}</h3>`);
    expect(html).not.toContain('mantine-Pagination');
  });

  it('syarat & alur di #syarat tanpa tanggal/tahun dan tanpa testimoni; tombol daftar di kepala & penutup', () => {
    const html = body();
    expect(html).toContain('id="syarat"');
    expect(html).toContain('href="#syarat"');
    expect(html).toContain(T.jadwalNote);
    // Teks saja (path SVG ikon bisa memuat angka seperti "2020").
    const syaratText = html.slice(html.indexOf('id="syarat"')).replace(/<[^>]*>/g, ' ');
    expect(syaratText).not.toMatch(/20\d\d/);
    expect(html).not.toContain('Cerita Sukses');
    expect(html).not.toContain('mantine-Stepper');
    expect(count(html, `aria-haspopup="dialog"`)).toBe(2);
  });

  it('Alur seleksi = bagian sendiri (h2) setelah #syarat, catatan jadwal ikut di Alur', () => {
    const html = body();
    const syaratStart = html.indexOf('id="syarat"');
    const syaratEnd = html.indexOf('</section>', syaratStart);
    const alurTitle = html.search(new RegExp(`<h2[^>]*>${T.alurTitle}</h2>`));
    expect(alurTitle).toBeGreaterThan(syaratEnd);
    expect(html.slice(syaratStart, syaratEnd)).not.toContain(T.alurTitle);
    expect(html.indexOf(T.jadwalNote)).toBeGreaterThan(alurTitle);
    expect(count(html, '<h4')).toBe(0);
  });

  it('memuat → kerangka aria-busy; galat → pesan + Coba lagi; kosong → pesan', () => {
    const loading = body({ keunggulan: { status: 'loading' }, ringkasan: { status: 'loading' } });
    expect(count(loading, 'aria-busy="true"')).toBe(2);
    const error = body({ keunggulan: { status: 'error' }, ringkasan: { status: 'error' } });
    expect(error).toContain(T.keunggulanError);
    expect(error).toContain(T.ringkasanError);
    expect(count(error, `>${T.retry}</button>`)).toBe(2);
    expect(body({ keunggulan: { status: 'ready', data: [] } })).toContain(T.keunggulanEmpty);
  });

  it('dana 0 / tahun ajaran kosong ditulis jujur', () => {
    const html = body({ ringkasan: { status: 'ready', data: { pendaftar: 0, danaRingkas: null, danaPenuh: null, tahunAjaran: null } } });
    expect(html).toContain(T.danaEmpty);
    expect(html).toContain(T.tahunAjaranEmpty);
  });
});

describe('BeasiswaPage', () => {
  it('render awal = kerangka memuat, bukan pesan galat', () => {
    const html = render(<BeasiswaPage />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain(T.keunggulanError);
  });
});

const api = (over: Partial<BeasiswaFormApi> = {}): BeasiswaFormApi => ({
  form: EMPTY_BEASISWA_FORM,
  setField: noop,
  blur: noop,
  errorOf: () => null,
  submitting: false,
  serverError: null,
  submit: async () => false,
  ...over,
});

describe('BeasiswaFormContent', () => {
  it('catatan privasi, dua kelompok berlegenda, 12 isian wajib, tombol kirim', () => {
    const html = render(<BeasiswaFormContent api={api()} onCancel={noop} onSubmit={noop} brandColor="#0A4E78" />);
    expect(html).toContain(F.privacy);
    expect(html).toContain(`>${F.siswa}</legend>`);
    expect(html).toContain(`>${F.ortu}</legend>`);
    expect(count(html, 'mantine-InputWrapper-required')).toBe(12);
    expect(html).toContain('type="date"');
    expect(html).toMatch(/max="\d{4}-\d{2}-\d{2}"/);
    expect(html).toContain(F.submit);
    expect(html).not.toContain('role="alert"');
  });

  it('galat kiriman (401) tampil di modal sebagai alert manusiawi; isian tetap terisi', () => {
    const html = render(
      <BeasiswaFormContent
        api={api({ serverError: SUBMIT_ERROR.unauthorized, form: { ...EMPTY_BEASISWA_FORM, namaLengkap: 'Ni Luh Ayu' } })}
        onCancel={noop}
        onSubmit={noop}
        brandColor="#0A4E78"
      />,
    );
    expect(html).toMatch(new RegExp(`role="alert"[^>]*>${SUBMIT_ERROR.unauthorized.slice(0, 40)}`));
    expect(html).toContain('value="Ni Luh Ayu"');
    expect(html).not.toContain('Unauthorized');
  });

  it('galat field tampil di bawah isian', () => {
    const html = render(<BeasiswaFormContent api={api({ errorOf: (f) => (f === 'nik' ? 'NIK harus 16 digit' : null) })} onCancel={noop} onSubmit={noop} brandColor="#0A4E78" />);
    expect(html).toContain('NIK harus 16 digit');
    expect(count(html, 'aria-invalid="true"')).toBe(1);
  });
});

describe('alamat lama pelajari-lebih-lanjut', () => {
  it('dialihkan permanen ke /pendidikan/beasiswa-desa#syarat', () => {
    PelajariLebihLanjutPage();
    expect(redirect).toHaveBeenCalledWith('/pendidikan/beasiswa-desa#syarat');
  });
});
