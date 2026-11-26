// @vitest-environment node
// Daftar publik tidak berkedip saat cari/pindah halaman: data query lama tetap tampil (refreshing) sampai data baru tiba;
// kerangka hanya untuk muatan pertama. Logika murni (hook React tidak bisa dijalankan di env node).
import { describe, expect, it } from 'vitest';
import { resolveKeepPrevious, toPagedListState } from '@/app/(public)/_com/kabar-list/keep-previous.logic';
import { listScrollDelta } from '@/app/(public)/_com/kabar-list/list-page-scroll';

describe('resolveKeepPrevious', () => {
  it('muatan pertama (belum ada hasil) → loading', () => {
    expect(resolveKeepPrevious(null, '1|')).toEqual({ status: 'loading' });
  });

  it('ganti kata kunci → data lama + refreshing', () => {
    expect(resolveKeepPrevious({ key: '1|', status: 'ready', data: ['lama'] }, '1|posyandu')).toEqual({
      status: 'ready',
      data: ['lama'],
      refreshing: true,
    });
  });

  it('data baru tiba → data baru tanpa refreshing', () => {
    expect(resolveKeepPrevious({ key: '1|posyandu', status: 'ready', data: ['baru'] }, '1|posyandu')).toEqual({
      status: 'ready',
      data: ['baru'],
      refreshing: false,
    });
  });

  it('kata kunci baru tanpa hasil → daftar kosong (pesan kosong), bukan daftar lama', () => {
    expect(resolveKeepPrevious({ key: '1|zzz', status: 'ready', data: [] }, '1|zzz')).toEqual({
      status: 'ready',
      data: [],
      refreshing: false,
    });
  });

  it('galat untuk query aktif → error', () => {
    expect(resolveKeepPrevious({ key: '2|', status: 'error' }, '2|')).toEqual({ status: 'error' });
  });

  it('galat query lama tidak menempel ke query baru → loading', () => {
    expect(resolveKeepPrevious({ key: '2|', status: 'error' }, '3|')).toEqual({ status: 'loading' });
  });
});

describe('toPagedListState', () => {
  const page = { items: ['a', 'b'], totalPages: 4 };

  it('loading → kerangka, 1 halaman', () => {
    expect(toPagedListState({ status: 'loading' })).toEqual({ items: [], totalPages: 1, loading: true, refreshing: false, failed: false });
  });

  it('refreshing → baris + jumlah halaman lama dipertahankan (paginasi tidak melompat)', () => {
    expect(toPagedListState({ status: 'ready', data: page, refreshing: true })).toEqual({
      items: ['a', 'b'],
      totalPages: 4,
      loading: false,
      refreshing: true,
      failed: false,
    });
  });

  it('error → failed, tanpa baris', () => {
    expect(toPagedListState({ status: 'error' })).toEqual({ items: [], totalPages: 1, loading: false, refreshing: false, failed: true });
  });
});

describe('listScrollDelta (gulir ke judul daftar setelah ganti halaman)', () => {
  it('judul masih terlihat di bawah navbar → tidak menggulir', () => {
    expect(listScrollDelta(120)).toBeNull();
    expect(listScrollDelta(80)).toBeNull();
  });

  it('judul sudah tergulir lewat (paginasi bawah) → naik sampai judul tepat di bawah navbar', () => {
    expect(listScrollDelta(-900)).toBe(-980);
    expect(listScrollDelta(40)).toBe(-40);
  });
});
