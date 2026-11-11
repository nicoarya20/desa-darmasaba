// @vitest-environment node
// Form publik Keamanan > Laporan Publik (/keamanan/laporan-publik):
// warga anonim harus bisa POST laporan tanpa login; sisa endpoint tetap admin.
import { describe, it, expect } from 'vitest';
import { isPublicPostPath } from '@/lib/auth-policy';

const BASE = '/api/keamanan/laporanpublik';

describe('laporan publik keamanan — whitelist POST anonim', () => {
  it('POST create boleh tanpa login (warga anonim)', () => {
    expect(isPublicPostPath(`${BASE}/create`)).toBe(true);
  });

  it('exact-match: trailing slash / sub-path tidak ikut publik', () => {
    expect(isPublicPostPath(`${BASE}/create/`)).toBe(false);
    expect(isPublicPostPath(`${BASE}/create/extra`)).toBe(false);
    expect(isPublicPostPath(BASE)).toBe(false);
  });

  it('update/hapus laporan (PUT/DELETE admin) tidak dibuka', () => {
    expect(isPublicPostPath(`${BASE}/abc123`)).toBe(false);
    expect(isPublicPostPath(`${BASE}/del/abc123`)).toBe(false);
  });

  it('endpoint keamanan lain tetap admin-only', () => {
    expect(isPublicPostPath('/api/keamanan/cctv/create')).toBe(false);
    expect(isPublicPostPath('/api/keamanan/polsek-terdekat/create')).toBe(false);
  });
});
