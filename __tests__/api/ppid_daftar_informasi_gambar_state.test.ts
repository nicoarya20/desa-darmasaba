// @vitest-environment node
// State admin Daftar Informasi Publik: gambar pendukung opsional. `gambarId` hanya dikirim bila ada gambar baru
// (create), dan di edit: tidak diisi = tidak dikirim, id = ganti, null = lepas.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, apiPost, apiGet } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  apiPost: { daftarCreate: vi.fn() },
  apiGet: { daftarFindMany: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ppid: { daftarinformasipublik: { create: { post: apiPost.daftarCreate }, 'find-many': { get: apiGet.daftarFindMany } } },
    },
  },
}));

import stateDaftar from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

const fetchMock = vi.fn();
const jsonResponse = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body });

// test-only: gambar dan baris fiktif.
const GAMBAR = { id: 'g1', link: '/api/fileStorage/findUnique/foto.webp', realName: 'foto.webp' };
const FORM = { jenisInformasi: 'Profil Desa', deskripsi: 'Deskripsi lengkap', tanggal: '2026-11-01' };
const putBodies = () =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT').map(([, init]) => JSON.parse(init.body));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  apiGet.daftarFindMany.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 1 } });
});

describe('state daftar informasi publik: gambar', () => {
  it('create: gambarId hanya dikirim bila ada gambar yang diunggah', async () => {
    apiPost.daftarCreate.mockResolvedValue({ status: 200 });
    stateDaftar.create.form = { ...FORM };
    await stateDaftar.create.create();
    await stateDaftar.create.create(undefined, GAMBAR.id);
    await stateDaftar.create.create('pdf-1', GAMBAR.id);
    const [tanpa, gambarSaja, keduanya] = apiPost.daftarCreate.mock.calls.map(([body]) => body);
    expect(tanpa).not.toHaveProperty('gambarId');
    expect(tanpa).not.toHaveProperty('fileId');
    expect(gambarSaja).toMatchObject({ jenisInformasi: 'Profil Desa', gambarId: GAMBAR.id });
    expect(gambarSaja).not.toHaveProperty('fileId');
    expect(keduanya).toMatchObject({ fileId: 'pdf-1', gambarId: GAMBAR.id });
  });

  it('edit.load menyimpan gambar saat ini (null untuk baris tanpa gambar); reset mengosongkannya', async () => {
    const row = { id: 'd1', ...FORM, file: null };
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { ...row, gambar: GAMBAR } }));
    await stateDaftar.edit.load('d1');
    expect(stateDaftar.edit.currentGambar).toEqual(GAMBAR);

    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { ...row, gambar: null } }));
    await stateDaftar.edit.load('d1');
    expect(stateDaftar.edit.currentGambar).toBeNull();

    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { ...row, gambar: GAMBAR } }));
    await stateDaftar.edit.load('d1');
    stateDaftar.edit.reset();
    expect(stateDaftar.edit.currentGambar).toBeNull();
  });

  it('edit.update: gambarId tidak dikirim / id baru / null untuk melepas', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));
    stateDaftar.edit.id = 'd1';
    stateDaftar.edit.form = { ...FORM };
    await stateDaftar.edit.update();
    await stateDaftar.edit.update(undefined, 'g-baru');
    await stateDaftar.edit.update(undefined, null);
    const [diam, ganti, lepas] = putBodies();
    expect(diam).not.toHaveProperty('gambarId');
    expect(ganti).toMatchObject({ gambarId: 'g-baru' });
    expect(lepas).toHaveProperty('gambarId', null);
  });
});
