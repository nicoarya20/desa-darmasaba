// @vitest-environment node
// Profil Perbekel: link laporan LHKPN (Google Drive) opsional. Validasi bersama (form admin, PUT server, halaman publik)
// dan endpoint PUT /profileperbekel/:id. Modul Elysia diuji lewat Request; prisma dan penghapus berkas di-mock.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { perbekel, removeStoredFile } = vi.hoisted(() => ({
  perbekel: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  removeStoredFile: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ default: { profilPerbekel: perbekel } }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import ProfilPerbekel from '@/app/api/[[...slugs]]/_lib/desa/profile/profilePerbekel';
import {
  isGoogleDriveUrl,
  LHKPN_URL_MAX,
  lhkpnUrlError,
  PESAN_LHKPN_URL_TIDAK_VALID,
  publicLhkpnUrl,
} from '@/lib/profil-perbekel-lhkpn';

// test-only: link Drive & baris rekaan.
const DRIVE = 'https://drive.google.com/file/d/1AbC/view?usp=sharing';
const ROW = {
  id: 'pb-1', biodata: '<p>Bio</p>', pengalaman: '<p>Kerja</p>', pengalamanOrganisasi: '<p>Org</p>',
  programUnggulan: '<p>Program</p>', imageId: 'img-1', image: { id: 'img-1' }, lhkpnUrl: null,
};
const BODY = {
  biodata: ROW.biodata, pengalaman: ROW.pengalaman, pengalamanOrganisasi: ROW.pengalamanOrganisasi,
  programUnggulan: ROW.programUnggulan, imageId: ROW.imageId,
};

const app = new Elysia({ prefix: '/api/desa/profile' }).use(ProfilPerbekel);
const put = (body: unknown) =>
  app.handle(
    new Request('http://localhost/api/desa/profile/profileperbekel/pb-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
const updateData = () => perbekel.update.mock.calls[0][0].data;

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  perbekel.findUnique.mockResolvedValue(ROW);
  perbekel.update.mockImplementation(({ data }) => Promise.resolve({ ...ROW, ...data }));
});

describe('isGoogleDriveUrl', () => {
  it('menerima link https drive.google.com dan docs.google.com', () => {
    expect(isGoogleDriveUrl(DRIVE)).toBe(true);
    expect(isGoogleDriveUrl('https://docs.google.com/document/d/1AbC/edit')).toBe(true);
    expect(isGoogleDriveUrl('https://DRIVE.google.com/drive/folders/1AbC')).toBe(true);
  });

  it('menolak http, host lain, host tiruan, kredensial, skema berbahaya, dan teks bukan URL', () => {
    for (const bad of [
      'http://drive.google.com/file/d/1AbC',
      'https://example.com/lhkpn.pdf',
      'https://drive.google.com.evil.example/file',
      'https://user:pass@drive.google.com/file/d/1AbC',
      'javascript:alert(1)',
      'drive.google.com/file/d/1AbC',
    ]) {
      expect(isGoogleDriveUrl(bad), bad).toBe(false);
    }
  });
});

describe('lhkpnUrlError / publicLhkpnUrl', () => {
  it('kosong, spasi, null, dan undefined valid (kolom opsional) dan tidak dirender di publik', () => {
    for (const empty of ['', '   ', null, undefined]) {
      expect(lhkpnUrlError(empty)).toBeNull();
      expect(publicLhkpnUrl(empty)).toBeNull();
    }
  });

  it('link valid di-trim; link tidak valid memberi pesan dan disembunyikan di publik', () => {
    expect(publicLhkpnUrl(`  ${DRIVE}  `)).toBe(DRIVE);
    expect(lhkpnUrlError('https://example.com/x')).toBe(PESAN_LHKPN_URL_TIDAK_VALID);
    expect(publicLhkpnUrl('javascript:alert(1)')).toBeNull();
  });

  it(`menolak link lebih dari ${LHKPN_URL_MAX} karakter`, () => {
    const panjang = `https://drive.google.com/file/d/${'a'.repeat(LHKPN_URL_MAX)}`;
    expect(lhkpnUrlError(panjang)).toContain(`${LHKPN_URL_MAX} karakter`);
  });
});

describe('PUT /profileperbekel/:id — lhkpnUrl', () => {
  it('menyimpan link Drive yang sudah di-trim', async () => {
    const res = await put({ ...BODY, lhkpnUrl: ` ${DRIVE} ` });
    expect(res.status).toBe(200);
    expect(updateData().lhkpnUrl).toBe(DRIVE);
    expect((await res.json()).data.lhkpnUrl).toBe(DRIVE);
  });

  it('string kosong mengosongkan kolom (null)', async () => {
    perbekel.findUnique.mockResolvedValue({ ...ROW, lhkpnUrl: DRIVE });
    const res = await put({ ...BODY, lhkpnUrl: '' });
    expect(res.status).toBe(200);
    expect(updateData().lhkpnUrl).toBeNull();
  });

  it('klien lama tanpa field lhkpnUrl tetap berhasil dan tidak mengubah nilai tersimpan', async () => {
    const res = await put(BODY);
    expect(res.status).toBe(200);
    expect(updateData().lhkpnUrl).toBeUndefined();
  });

  it('link bukan Google Drive: 400 dengan pesan, tidak menulis ke database', async () => {
    const res = await put({ ...BODY, lhkpnUrl: 'https://example.com/lhkpn.pdf' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_LHKPN_URL_TIDAK_VALID });
    expect(perbekel.update).not.toHaveBeenCalled();
  });
});
