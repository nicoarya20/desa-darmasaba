// @vitest-environment node
// Lomba 2.5: state admin PPID (Valtio) untuk berkas PDF dan profil lembaga. `fileId` hanya dikirim bila ada PDF
// baru, data berkas dari API ikut tersimpan di state, dan simpan profil lembaga melapor sukses/gagal dengan benar.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, apiPost, apiGet } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  apiPost: { dasarHukumUpdate: vi.fn(), daftarCreate: vi.fn() },
  apiGet: { dasarHukumFind: vi.fn(), daftarFindMany: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ppid: {
        dasarhukumppid: { update: { post: apiPost.dasarHukumUpdate }, 'find-by-id': { get: apiGet.dasarHukumFind } },
        daftarinformasipublik: { create: { post: apiPost.daftarCreate }, 'find-many': { get: apiGet.daftarFindMany } },
      },
    },
  },
}));

import stateDaftar from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import stateDasarHukum from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum';
import stateLembaga from '@/app/admin/(dashboard)/_state/ppid/profil_lembaga/profilLembaga';

const fetchMock = vi.fn();
const jsonResponse = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body });

// test-only: berkas dan baris fiktif.
const FILE = { id: 'f1', link: '/api/fileStorage/findUnique/a.pdf', realName: 'a.pdf' };
const HUKUM = { id: '1', judul: 'Judul dasar hukum', content: 'Isi dasar hukum', fileId: 'f-lama', file: { ...FILE, id: 'f-lama' } };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('state dasar hukum: save', () => {
  it('tanpa newFileId: payload hanya id, judul, content (berkas lama tidak dikirim ulang)', async () => {
    apiPost.dasarHukumUpdate.mockResolvedValue({ status: 200 });
    apiGet.dasarHukumFind.mockResolvedValue({ status: 200, data: { data: HUKUM } });
    expect(await stateDasarHukum.update.save(HUKUM)).toBe(true);
    expect(apiPost.dasarHukumUpdate).toHaveBeenCalledWith({ id: '1', judul: HUKUM.judul, content: HUKUM.content });
  });

  it('dengan newFileId: fileId ikut dikirim dan data dimuat ulang', async () => {
    apiPost.dasarHukumUpdate.mockResolvedValue({ status: 200 });
    apiGet.dasarHukumFind.mockResolvedValue({ status: 200, data: { data: { ...HUKUM, fileId: FILE.id, file: FILE } } });
    expect(await stateDasarHukum.update.save(HUKUM, FILE.id)).toBe(true);
    expect(apiPost.dasarHukumUpdate).toHaveBeenCalledWith({ id: '1', judul: HUKUM.judul, content: HUKUM.content, fileId: FILE.id });
    expect(stateDasarHukum.findById.data?.file).toEqual(FILE);
  });

  it('form tidak valid atau server menolak: mengembalikan false dan memberi tahu pengguna', async () => {
    expect(await stateDasarHukum.update.save({ ...HUKUM, judul: 'ab' })).toBe(false);
    expect(apiPost.dasarHukumUpdate).not.toHaveBeenCalled();
    apiPost.dasarHukumUpdate.mockResolvedValue({ status: 400 });
    expect(await stateDasarHukum.update.save(HUKUM, 'tidak-ada')).toBe(false);
    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});

describe('state daftar informasi publik', () => {
  it('create: fileId hanya dikirim bila ada PDF yang diunggah', async () => {
    apiPost.daftarCreate.mockResolvedValue({ status: 200 });
    apiGet.daftarFindMany.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 1 } });
    stateDaftar.create.form = { jenisInformasi: 'Profil Desa', deskripsi: 'Deskripsi lengkap', tanggal: '2026-11-01' };
    await stateDaftar.create.create();
    await stateDaftar.create.create(FILE.id);
    expect(apiPost.daftarCreate.mock.calls[0][0]).not.toHaveProperty('fileId');
    expect(apiPost.daftarCreate.mock.calls[1][0]).toMatchObject({ jenisInformasi: 'Profil Desa', fileId: FILE.id });
  });

  it('edit.load menyimpan berkas saat ini; update mengirim fileId hanya untuk PDF baru', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 'd1', jenisInformasi: 'Profil', deskripsi: 'Deskripsi', tanggal: '2026-11-01', file: FILE } }),
    );
    await stateDaftar.edit.load('d1');
    expect(stateDaftar.edit.currentFile).toEqual(FILE);

    fetchMock.mockResolvedValue(jsonResponse({ success: true }));
    apiGet.daftarFindMany.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 1 } });
    await stateDaftar.edit.update('f-baru');
    await stateDaftar.edit.update();
    const bodies = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT').map(([, init]) => JSON.parse(init.body));
    expect(bodies[0]).toMatchObject({ fileId: 'f-baru' });
    expect(bodies[1]).not.toHaveProperty('fileId');

    stateDaftar.edit.reset();
    expect(stateDaftar.edit.currentFile).toBeNull();
  });
});

describe('state profil lembaga', () => {
  it('find.load: menyimpan data, atau null bila belum diisi', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 'pl-1', deskripsi: '<p>x</p>' } }));
    expect((await stateLembaga.find.load())?.id).toBe('pl-1');
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: null }));
    expect(await stateLembaga.find.load()).toBeNull();
    expect(stateLembaga.find.data).toBeNull();
    expect(stateLembaga.find.loading).toBe(false);
  });

  it('find.load gagal: error terisi dengan konteks dan tidak melempar', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: 'Gagal mengambil profil lembaga PPID' }, 500));
    expect(await stateLembaga.find.load()).toBeNull();
    expect(stateLembaga.find.error).toBe('Gagal mengambil profil lembaga PPID');
    expect(console.error).toHaveBeenCalled();
  });

  it('save.submit: PUT ke endpoint admin dengan isian, state diperbarui dan toast sukses', async () => {
    const saved = { id: 'pl-1', deskripsi: '<p>x</p>', tujuan: null, tugasFungsi: null, gambarAlurId: null, gambarAlur: null };
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: saved }));
    const form = { deskripsi: '<p>x</p>', tujuan: '', tugasFungsi: '', gambarAlurId: null };
    expect(await stateLembaga.save.submit(form)).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/ppid/profillembagappid/update');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual(form);
    expect(stateLembaga.find.data).toEqual(saved);
    expect(toast.success).toHaveBeenCalledOnce();
  });

  it('save.submit ditolak server (403): false, toast galat, data lama tidak berubah', async () => {
    stateLembaga.find.data = null;
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: 'Hanya admin' }, 403));
    expect(await stateLembaga.save.submit({ deskripsi: '', tujuan: '', tugasFungsi: '' })).toBe(false);
    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();
    expect(stateLembaga.find.data).toBeNull();
    expect(stateLembaga.save.loading).toBe(false);
  });
});
