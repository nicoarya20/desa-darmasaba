// @vitest-environment node
// Edit CCTV admin: status muat halaman + cctvState.edit.load mengosongkan data lama, tidak menimpa dengan respons basi.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import cctvState from '@/app/admin/(dashboard)/_state/keamanan/cctv';
import { statusMuatEdit } from '@/app/admin/(dashboard)/keamanan/cctv/[id]/edit/edit-cctv.logic';

// test-only: satu rekaman CCTV dari API.
const rekaman = (id: string, kode: string) => ({
  id,
  kode,
  nama: `Nama ${kode}`,
  lokasi: `Jalan ${kode}`,
  latitude: -8.57,
  longitude: 115.19,
  status: 'Offline',
  lastActive: '2026-02-12T14:30:00.000Z',
});

describe('statusMuatEdit', () => {
  const dasar = { dimulai: true, memuat: false, idTermuat: 'a', idHalaman: 'a' };

  it('memuat sebelum load dimulai (render pertama) atau selama memuat', () => {
    expect(statusMuatEdit({ ...dasar, dimulai: false })).toBe('memuat');
    expect(statusMuatEdit({ ...dasar, dimulai: false, idTermuat: '' })).toBe('memuat');
    expect(statusMuatEdit({ ...dasar, memuat: true })).toBe('memuat');
  });

  it('siap hanya bila id termuat sama dengan id halaman', () => {
    expect(statusMuatEdit(dasar)).toBe('siap');
    expect(statusMuatEdit({ ...dasar, idTermuat: 'b' })).toBe('gagal');
  });

  it('gagal bila selesai memuat tanpa data', () => {
    expect(statusMuatEdit({ ...dasar, idTermuat: '' })).toBe('gagal');
    expect(statusMuatEdit({ ...dasar, idTermuat: '', idHalaman: '' })).toBe('gagal');
  });
});

describe('cctvState.edit.load', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cctvState.edit.id = 'x';
    cctvState.edit.form = { ...cctvState.edit.form, kode: 'CCTV-X', nama: 'Nama X', lokasi: 'Jalan X' };
    cctvState.edit.memuat = false;
  });

  it('sukses: mengisi id + form, status muat menyala selama memuat', async () => {
    let selesai!: (v: unknown) => void;
    vi.spyOn(cctvState.findUnique, 'load').mockReturnValue(new Promise((r) => { selesai = r; }) as never);

    const janji = cctvState.edit.load('y');
    expect(cctvState.edit.memuat).toBe(true);
    expect(cctvState.edit.id).toBe('');
    expect(cctvState.edit.form.kode).toBe('');

    selesai(rekaman('y', 'CCTV-Y'));
    await janji;
    expect(cctvState.edit.memuat).toBe(false);
    expect(cctvState.edit.id).toBe('y');
    expect(cctvState.edit.form).toMatchObject({ kode: 'CCTV-Y', latitude: '-8.57', longitude: '115.19', status: 'Offline' });
  });

  it('gagal: id kosong dan form default, data CCTV lama tidak tersisa', async () => {
    vi.spyOn(cctvState.findUnique, 'load').mockResolvedValue(null);

    await cctvState.edit.load('y');
    expect(cctvState.edit.memuat).toBe(false);
    expect(cctvState.edit.id).toBe('');
    expect(cctvState.edit.form).toMatchObject({ kode: '', nama: '', lokasi: '', latitude: '', longitude: '' });
  });

  it('respons basi tidak menimpa hasil load terbaru', async () => {
    const tunda: Record<string, (v: unknown) => void> = {};
    vi.spyOn(cctvState.findUnique, 'load').mockImplementation(
      (id: string) => new Promise((r) => { tunda[id] = r; }) as never,
    );

    const lama = cctvState.edit.load('a');
    const baru = cctvState.edit.load('b');
    tunda.b(rekaman('b', 'CCTV-B'));
    await baru;
    expect(cctvState.edit.memuat).toBe(false);

    tunda.a(rekaman('a', 'CCTV-A'));
    await lama;
    expect(cctvState.edit.id).toBe('b');
    expect(cctvState.edit.form.kode).toBe('CCTV-B');
    expect(cctvState.edit.memuat).toBe(false);
  });

  it('respons lama yang selesai belakangan tidak mematikan status muat load terbaru', async () => {
    const tunda: Record<string, (v: unknown) => void> = {};
    vi.spyOn(cctvState.findUnique, 'load').mockImplementation(
      (id: string) => new Promise((r) => { tunda[id] = r; }) as never,
    );

    const lama = cctvState.edit.load('a');
    const baru = cctvState.edit.load('b');
    tunda.a(rekaman('a', 'CCTV-A'));
    await lama;
    expect(cctvState.edit.memuat).toBe(true);
    expect(cctvState.edit.id).toBe('');

    tunda.b(null);
    await baru;
    expect(cctvState.edit.memuat).toBe(false);
    expect(cctvState.edit.id).toBe('');
  });
});
