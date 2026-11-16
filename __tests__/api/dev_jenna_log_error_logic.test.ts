// @vitest-environment node
// Logika murni halaman Developer › Jenna › Log Error: transisi state (ganti rentang, muat lebih banyak, galat),
// query endpoint, label sebab galat, dan pemotongan rincian galat.
import { describe, expect, it } from 'vitest';
import {
  ERROR_LOG_DEFAULT_DAYS,
  ERROR_LOG_RANGES,
  beginLoad,
  beginLoadMore,
  canLoadMore,
  errorLogQuery,
  initialErrorLog,
  loadFailed,
  loadMoreFailed,
  loadMoreSucceeded,
  loadSucceeded,
  parseErrorLogDays,
  type ErrorLogState,
} from '@/app/dev/jenna/log-error/log-error.logic';
import {
  ERROR_DETAIL_CLIP_CHARS,
  clipErrorDetail,
  errorCodeLabel,
} from '@/app/dev/jenna/percakapan/percakapan.logic';
import { JENNA_ERROR_LOG_DAYS, type JennaErrorLogItem } from '@/lib/jenna/usage-types';

const item = (id: string, over: Partial<JennaErrorLogItem> = {}): JennaErrorLogItem => ({
  id,
  conversationId: `conv-${id}`,
  createdAt: '2026-11-14T03:00:00.000Z',
  errorCode: 'timeout',
  errorDetail: 'TimeoutError: waktu habis',
  providerSlot: 'chat_openai',
  model: 'model-a',
  latencyMs: 30_000,
  preview: 'Jam buka kantor desa?',
  session: 'ab12cd34',
  ...over,
});

const loaded = (over: Partial<ErrorLogState> = {}): ErrorLogState => ({
  ...initialErrorLog(),
  items: [item('1'), item('2')],
  nextCursor: '2',
  ...over,
});

describe('rentang log error', () => {
  it('bawaan 7 hari; pilihan sama persis dengan yang diterima API', () => {
    expect(ERROR_LOG_DEFAULT_DAYS).toBe(7);
    expect(initialErrorLog().days).toBe(7);
    expect(ERROR_LOG_RANGES.map((r) => r.days)).toEqual([...JENNA_ERROR_LOG_DAYS]);
    expect(ERROR_LOG_RANGES.map((r) => r.label)).toEqual(['24 jam', '7 hari', '30 hari']);
  });

  it('parseErrorLogDays hanya menerima pilihan yang ada', () => {
    expect(parseErrorLogDays('1')).toBe(1);
    expect(parseErrorLogDays('7')).toBe(7);
    expect(parseErrorLogDays('30')).toBe(30);
    expect(parseErrorLogDays('14')).toBeNull();
    expect(parseErrorLogDays('07')).toBeNull();
    expect(parseErrorLogDays('')).toBeNull();
  });
});

describe('muat halaman pertama', () => {
  it('state awal: belum ada daftar, tidak sedang memuat', () => {
    expect(initialErrorLog()).toEqual({
      days: 7,
      items: null,
      nextCursor: null,
      loading: false,
      loadingMore: false,
      error: null,
      moreError: null,
    });
  });

  it('ganti rentang → daftar dan kursor lama dibuang, galat lama dihapus', () => {
    const next = beginLoad(loaded({ error: 'x', moreError: 'y', loadingMore: true }), 30);
    expect(next).toEqual({
      days: 30,
      items: null,
      nextCursor: null,
      loading: true,
      loadingMore: false,
      error: null,
      moreError: null,
    });
  });

  it('rentang sama (muat ulang) → daftar lama tetap tampil selama memuat', () => {
    const before = loaded({ error: 'x' });
    const next = beginLoad(before, 7);
    expect(next.items).toEqual(before.items);
    expect(next.nextCursor).toBe('2');
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('berhasil → daftar diganti halaman pertama, bukan ditambahkan', () => {
    const next = loadSucceeded(beginLoad(loaded(), 7), { items: [item('9')], nextCursor: null, days: 7 });
    expect(next.items?.map((i) => i.id)).toEqual(['9']);
    expect(next.nextCursor).toBeNull();
    expect(next.loading).toBe(false);
  });

  it('berhasil tanpa hasil → daftar kosong (bukan null), sehingga empty state yang tampil', () => {
    const next = loadSucceeded(beginLoad(initialErrorLog(), 1), { items: [], nextCursor: null, days: 1 });
    expect(next.items).toEqual([]);
    expect(next.days).toBe(1);
  });

  it('gagal saat muat pertama → pesan galat, daftar tetap null', () => {
    const next = loadFailed(beginLoad(initialErrorLog(), 7), 'Gagal memuat log error Jenna.');
    expect(next).toMatchObject({ items: null, loading: false, error: 'Gagal memuat log error Jenna.' });
  });

  it('gagal saat muat ulang → daftar terakhir dipertahankan', () => {
    const next = loadFailed(beginLoad(loaded(), 7), 'Gagal');
    expect(next.items?.map((i) => i.id)).toEqual(['1', '2']);
    expect(next.nextCursor).toBe('2');
    expect(next.error).toBe('Gagal');
  });
});

describe('muat lebih banyak', () => {
  it('canLoadMore: hanya bila ada kursor dan tidak ada permintaan berjalan', () => {
    expect(canLoadMore(loaded())).toBe(true);
    expect(canLoadMore(loaded({ nextCursor: null }))).toBe(false);
    expect(canLoadMore(loaded({ loading: true }))).toBe(false);
    expect(canLoadMore(loaded({ loadingMore: true }))).toBe(false);
    expect(canLoadMore(initialErrorLog())).toBe(false);
  });

  it('mulai → loadingMore, galat lanjutan lama dihapus, daftar tidak berubah', () => {
    const next = beginLoadMore(loaded({ moreError: 'x' }));
    expect(next.loadingMore).toBe(true);
    expect(next.moreError).toBeNull();
    expect(next.items?.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('berhasil → ditambahkan di akhir dengan urutan terjaga, kursor diperbarui', () => {
    const next = loadMoreSucceeded(beginLoadMore(loaded()), { items: [item('3'), item('4')], nextCursor: '4', days: 7 });
    expect(next.items?.map((i) => i.id)).toEqual(['1', '2', '3', '4']);
    expect(next.nextCursor).toBe('4');
    expect(next.loadingMore).toBe(false);
  });

  it('halaman terakhir → kursor null, tombol tidak bisa dipakai lagi', () => {
    const next = loadMoreSucceeded(beginLoadMore(loaded()), { items: [item('3')], nextCursor: null, days: 7 });
    expect(next.nextCursor).toBeNull();
    expect(canLoadMore(next)).toBe(false);
  });

  it('gagal → daftar dan kursor dipertahankan supaya bisa dicoba lagi', () => {
    const next = loadMoreFailed(beginLoadMore(loaded()), 'Gagal memuat giliran berikutnya.');
    expect(next.items?.map((i) => i.id)).toEqual(['1', '2']);
    expect(next.nextCursor).toBe('2');
    expect(next.moreError).toBe('Gagal memuat giliran berikutnya.');
    expect(canLoadMore(next)).toBe(true);
  });

  it('transisi tidak mengubah state masukan', () => {
    const before = loaded();
    const copy = structuredClone(before);
    loadMoreSucceeded(beginLoadMore(before), { items: [item('3')], nextCursor: null, days: 7 });
    beginLoad(before, 30);
    expect(before).toEqual(copy);
  });
});

describe('errorLogQuery', () => {
  it('halaman pertama hanya membawa days', () => {
    expect(errorLogQuery(7, null)).toBe('days=7');
    expect(errorLogQuery(30, null)).toBe('days=30');
  });

  it('halaman lanjutan membawa cursor yang di-encode', () => {
    expect(errorLogQuery(1, 'cm3abc')).toBe('days=1&cursor=cm3abc');
    expect(errorLogQuery(1, 'a b&c')).toBe('days=1&cursor=a+b%26c');
  });
});

describe('errorCodeLabel untuk galat provider', () => {
  it('jenis yang dikenal punya label sendiri, bukan kode mentah', () => {
    expect(errorCodeLabel('provider_config')).toBe('Provider menolak permintaan');
    expect(errorCodeLabel('provider_busy')).toBe('Provider sedang sibuk');
    expect(errorCodeLabel('provider_unavailable')).toBe('Provider tidak bisa dihubungi');
    expect(errorCodeLabel('provider_bad_response')).toBe('Jawaban provider tidak terbaca');
  });

  it('jenis yang belum dikenal tetap terbaca sebagai galat provider', () => {
    expect(errorCodeLabel('provider_rate_limit')).toBe('Galat provider (rate_limit)');
    expect(errorCodeLabel('provider_constructor')).toBe('Galat provider (constructor)');
  });
});

describe('clipErrorDetail', () => {
  it('teks pendek tidak dipotong', () => {
    expect(clipErrorDetail('HTTP 401: invalid key')).toEqual({ text: 'HTTP 401: invalid key', clipped: false });
    const exact = 'x'.repeat(ERROR_DETAIL_CLIP_CHARS);
    expect(clipErrorDetail(exact)).toEqual({ text: exact, clipped: false });
  });

  it('teks panjang dipotong di batas dan diberi elipsis', () => {
    const long = 'x'.repeat(ERROR_DETAIL_CLIP_CHARS + 1);
    const clip = clipErrorDetail(long);
    expect(clip.clipped).toBe(true);
    expect(clip.text).toBe(`${'x'.repeat(ERROR_DETAIL_CLIP_CHARS)}…`);
  });

  it('batas bisa diatur', () => {
    expect(clipErrorDetail('abcdef', 3)).toEqual({ text: 'abc…', clipped: true });
  });
});
