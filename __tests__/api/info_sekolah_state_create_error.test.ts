// @vitest-environment node
// Galat jaringan saat "Tambah" di admin Info Sekolah wajib tercatat sebagai console.error berkonteks (bukan
// console.log tanpa keterangan) dan tetap memberi toast gagal ke admin.
import { afterEach, describe, expect, it, vi } from 'vitest';

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

// ApiFetch apa pun (…infosekolahpaud.X.create.post) melempar galat jaringan.
vi.mock('@/lib/api-fetch', () => {
  const failing: unknown = new Proxy(() => undefined, {
    get: (_target, key) => (key === 'post' ? () => Promise.reject(new Error('network down')) : failing),
  });
  return { default: failing };
});

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

afterEach(() => vi.clearAllMocks());

describe('create() state Info Sekolah saat API gagal', () => {
  it.each([
    ['jenjangPendidikan', { nama: 'SD' }, 'Gagal menambahkan jenjang pendidikan:'],
    ['lembagaPendidikan', { nama: 'SD No. 8', jenjangId: 'j1' }, 'Gagal menambahkan lembaga pendidikan:'],
    ['siswa', { nama: 'Budi', lembagaId: 'l1' }, 'Gagal menambahkan siswa:'],
    ['pengajar', { nama: 'Bu Ani', lembagaId: 'l1' }, 'Gagal menambahkan pengajar:'],
  ] as const)('%s → console.error berkonteks + toast gagal', async (key, form, message) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const branch = infoSekolahPaud[key].create as { form: object; create: () => Promise<unknown>; loading: boolean };
    Object.assign(branch.form, form);

    await branch.create();

    expect(error).toHaveBeenCalledWith(message, expect.objectContaining({ message: 'network down' }));
    expect(log).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Gagal menambahkan data');
    expect(branch.loading).toBe(false);
  });
});
