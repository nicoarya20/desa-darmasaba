// @vitest-environment node
// Laporan Publik (Keamanan): label status, format tanggal WITA, URL, validasi formulir, sumber data API.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatTanggalWaktu,
  laporanDetailHref,
  laporanListHref,
  pickerToForm,
  pickerValue,
  statusInfo,
  validateLaporanForm,
} from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/laporan.logic';
import { loadLaporanDetail, loadLaporanPage } from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/laporan.source';

describe('statusInfo', () => {
  it('memetakan enum StatusLaporan ke label teks + nada warna', () => {
    expect(statusInfo('Selesai')).toEqual({ label: 'Selesai', tone: 'selesai' });
    expect(statusInfo('Proses')).toEqual({ label: 'Dalam proses', tone: 'proses' });
    // Enum/API tetap `Gagal`; hanya label tampilan yang dilunakkan.
    expect(statusInfo('Gagal')).toEqual({ label: 'Tidak terselesaikan', tone: 'gagal' });
    expect(statusInfo('Baru')).toEqual({ label: 'Baru', tone: 'baru' });
  });

  it('nilai tak dikenal tampil apa adanya, kosong → "Tanpa status"', () => {
    expect(statusInfo('Ditunda')).toEqual({ label: 'Ditunda', tone: 'lain' });
    expect(statusInfo('')).toEqual({ label: 'Tanpa status', tone: 'lain' });
    expect(statusInfo(null)).toEqual({ label: 'Tanpa status', tone: 'lain' });
  });
});

describe('formatTanggalWaktu', () => {
  it('tanggal + jam WITA format Indonesia (bukan "24/11/2025, 16.58.55")', () => {
    expect(formatTanggalWaktu('2025-11-24T08:58:55.080Z')).toBe('Senin, 24 November 2025, 16.58');
  });

  it('melewati tengah malam UTC → tanggal WITA berikutnya, jam 2 digit', () => {
    expect(formatTanggalWaktu('2026-07-06T16:05:00.000Z')).toBe('Selasa, 7 Juli 2026, 00.05');
  });

  it('kosong atau tidak valid → null', () => {
    expect(formatTanggalWaktu(null)).toBeNull();
    expect(formatTanggalWaktu('')).toBeNull();
    expect(formatTanggalWaktu('bukan tanggal')).toBeNull();
  });
});

describe('URL', () => {
  it('daftar menulis ?search & ?page hanya bila perlu', () => {
    expect(laporanListHref()).toBe('/keamanan/laporan-publik');
    expect(laporanListHref({ search: '  sampah ', page: 1 })).toBe('/keamanan/laporan-publik?search=sampah');
    expect(laporanListHref({ search: 'jalan', page: 2 })).toBe('/keamanan/laporan-publik?search=jalan&page=2');
  });

  it('detail meng-encode id', () => {
    expect(laporanDetailHref('cmra8yx1d000kmr0sc3k5xfpt')).toBe('/keamanan/laporan-publik/cmra8yx1d000kmr0sc3k5xfpt');
    expect(laporanDetailHref('a/b')).toBe('/keamanan/laporan-publik/a%2Fb');
  });
});

describe('validateLaporanForm', () => {
  const valid = { judul: 'Lampu jalan padam', lokasi: 'Banjar Teba', tanggalWaktu: '2026-11-10T19:30:00', kronologi: '' };

  it('isian lengkap → tanpa galat (kronologi opsional, sama dengan skema state)', () => {
    expect(validateLaporanForm(valid)).toEqual({});
  });

  it('formulir kosong → galat judul, lokasi, tanggal', () => {
    const errors = validateLaporanForm({ judul: '', lokasi: '', tanggalWaktu: '', kronologi: '' });
    expect(errors).toEqual({
      judul: 'Judul minimal 3 karakter.',
      lokasi: 'Lokasi minimal 3 karakter.',
      tanggalWaktu: 'Tanggal dan waktu kejadian wajib diisi.',
    });
  });

  it('spasi saja / < 3 karakter setelah trim → galat', () => {
    expect(validateLaporanForm({ ...valid, judul: '     ' }).judul).toBeDefined();
    expect(validateLaporanForm({ ...valid, lokasi: ' ab ' }).lokasi).toBeDefined();
  });

  it('tanggal tidak terbaca → galat', () => {
    expect(validateLaporanForm({ ...valid, tanggalWaktu: 'xx' }).tanggalWaktu).toBeDefined();
  });

  it('waktu kejadian di masa depan → galat jelas; tepat "sekarang" masih boleh', () => {
    const now = new Date('2026-11-12T19:30:00');
    expect(validateLaporanForm({ ...valid, tanggalWaktu: '2026-11-12T19:31:00' }, now)).toEqual({
      tanggalWaktu: 'Waktu kejadian tidak boleh melewati waktu sekarang.',
    });
    expect(validateLaporanForm({ ...valid, tanggalWaktu: '2026-11-13T08:00:00' }, now).tanggalWaktu).toBeDefined();
    expect(validateLaporanForm({ ...valid, tanggalWaktu: '2026-11-12T19:30:00' }, now)).toEqual({});
  });

  it('tanpa argumen `now` memakai waktu saat ini', () => {
    const besok = new Date(Date.now() + 86_400_000).toISOString();
    expect(validateLaporanForm({ ...valid, tanggalWaktu: besok }).tanggalWaktu).toBe(
      'Waktu kejadian tidak boleh melewati waktu sekarang.',
    );
  });
});

describe('nilai DateTimePicker', () => {
  it('format berspasi Mantine → ISO lokal ber-T (dibaca sama di semua peramban)', () => {
    expect(pickerToForm('2025-11-24 16:58:00')).toBe('2025-11-24T16:58:00');
    expect(new Date(pickerToForm('2025-11-24 16:58:00')).getTime()).not.toBeNaN();
    expect(pickerToForm(null)).toBe('');
  });

  it('string form → Date atau null', () => {
    expect(pickerValue('')).toBeNull();
    expect(pickerValue('abc')).toBeNull();
    expect(pickerValue('2025-11-24T08:58:55.080Z')?.toISOString()).toBe('2025-11-24T08:58:55.080Z');
  });
});

describe('laporan.source', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubFetch = (status: number, body: unknown) => {
    const fn = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fn);
    return fn;
  };

  it('loadLaporanPage memanggil find-many dengan page/limit/search dan membaca totalPages', async () => {
    const fn = stubFetch(200, { success: true, data: [{ id: 'a' }], totalPages: 3 });
    const res = await loadLaporanPage({ page: 2, limit: 10, search: 'pohon' });
    expect(fn).toHaveBeenCalledWith('/api/keamanan/laporanpublik/find-many?page=2&limit=10&search=pohon');
    expect(res).toEqual({ items: [{ id: 'a' }], totalPages: 3 });
  });

  it('loadLaporanPage tanpa search tidak mengirim parameter search; totalPages 0 → 1', async () => {
    const fn = stubFetch(200, { success: true, data: [], totalPages: 0 });
    expect(await loadLaporanPage({ page: 1, limit: 10, search: '' })).toEqual({ items: [], totalPages: 1 });
    expect(fn).toHaveBeenCalledWith('/api/keamanan/laporanpublik/find-many?page=1&limit=10');
  });

  it('loadLaporanPage melempar galat berkonteks bila success:false atau HTTP gagal', async () => {
    stubFetch(200, { success: false, message: 'Gagal mengambil data laporan publik' });
    await expect(loadLaporanPage({ page: 1, limit: 10, search: '' })).rejects.toThrow('Gagal mengambil data laporan publik');
    stubFetch(500, {});
    await expect(loadLaporanPage({ page: 1, limit: 10, search: '' })).rejects.toThrow('HTTP 500');
  });

  it('loadLaporanDetail: ditemukan → data; tidak ada / nonaktif / 404 → null; 500 → galat', async () => {
    stubFetch(200, { success: true, data: { id: 'a', isActive: true } });
    expect(await loadLaporanDetail('a')).toEqual({ id: 'a', isActive: true });
    stubFetch(200, { success: false, message: 'Laporan publik tidak ditemukan' });
    expect(await loadLaporanDetail('x')).toBeNull();
    stubFetch(200, { success: true, data: { id: 'a', isActive: false } });
    expect(await loadLaporanDetail('a')).toBeNull();
    stubFetch(404, {});
    expect(await loadLaporanDetail('x')).toBeNull();
    stubFetch(500, {});
    await expect(loadLaporanDetail('a')).rejects.toThrow('HTTP 500');
  });
});
