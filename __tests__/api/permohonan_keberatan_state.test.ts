// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ppid: { permohonankeberataninformasipublik: { create: { post: postMock } } },
    },
  },
}));
vi.mock('react-toastify', () => ({
  toast: { error: toastError, success: toastSuccess },
}));

import permohonanKeberatanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';
import {
  ALASAN_KEBERATAN_MAX_LENGTH,
  ALASAN_KEBERATAN_TOO_LONG_MESSAGE,
} from '@/lib/permohonan-keberatan';

const fillForm = (alasan: string) => {
  permohonanKeberatanInformasi.create.form = {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    notelp: '081234567890',
    alasan,
  };
};

describe('permohonanKeberatanInformasi.create', () => {
  beforeEach(() => {
    postMock.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it('blocks client-side and never calls the API when alasan is too long', async () => {
    fillForm(`<p>${'a'.repeat(ALASAN_KEBERATAN_MAX_LENGTH + 1)}</p>`);

    const ok = await permohonanKeberatanInformasi.create.create();

    expect(ok).toBe(false);
    expect(postMock).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(ALASAN_KEBERATAN_TOO_LONG_MESSAGE);
  });

  it('reports failure (not success) when the server answers 400', async () => {
    fillForm('<p>Alasan valid</p>');
    postMock.mockResolvedValue({
      data: null,
      error: { status: 400, value: { success: false, message: 'Pesan dari server' } },
    });

    const ok = await permohonanKeberatanInformasi.create.create();

    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalledWith('Pesan dari server');
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('reports success when the server accepts the permohonan', async () => {
    fillForm('<p>Alasan valid</p>');
    postMock.mockResolvedValue({ data: { success: true }, error: null });

    const ok = await permohonanKeberatanInformasi.create.create();

    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalled();
  });
});
