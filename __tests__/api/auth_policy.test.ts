// @vitest-environment node
// Kebijakan role/akses Better Auth — fungsi murni, tanpa DB.
import { describe, it, expect } from 'vitest';
import {
  ROLE_DEVELOPER,
  ROLE_SUPER_ADMIN,
  ROLE_USER,
  resolveRoleForNewUser,
  shouldPromoteRole,
  isDeveloperRole,
  isAdminRole,
  isAccountActive,
  publicOriginFromHeaders,
  isPublicPostPath,
  isPublicGetPath,
  decideDevAccess,
  defaultRouteForRole,
  DEV_HOME_PATH,
  ADMIN_HOME_PATH,
} from '@/lib/auth-policy';

describe('resolveRoleForNewUser', () => {
  const lists = {
    developerEmails: ['dev@desa.id', 'both@desa.id'],
    superAdminEmails: ['boss@desa.id', 'both@desa.id'],
  };

  it('user Google baru default roleId "5" (USER)', () => {
    expect(resolveRoleForNewUser('warga@gmail.com', lists)).toBe(ROLE_USER);
  });

  it('email di SUPER_ADMIN_EMAILS → roleId "1" (SUPER ADMIN)', () => {
    expect(resolveRoleForNewUser('boss@desa.id', lists)).toBe(ROLE_SUPER_ADMIN);
  });

  it('email di DEVELOPER_EMAILS → roleId "0" (DEVELOPER)', () => {
    expect(resolveRoleForNewUser('dev@desa.id', lists)).toBe(ROLE_DEVELOPER);
  });

  it('email di kedua list → DEVELOPER menang', () => {
    expect(resolveRoleForNewUser('both@desa.id', lists)).toBe(ROLE_DEVELOPER);
  });

  it('pencocokan email case-insensitive (Better Auth simpan email lowercase)', () => {
    const mixed = { developerEmails: ['Dev@Desa.id'], superAdminEmails: ['BOSS@desa.id'] };
    expect(resolveRoleForNewUser('dev@desa.id', mixed)).toBe(ROLE_DEVELOPER);
    expect(resolveRoleForNewUser('boss@desa.id', mixed)).toBe(ROLE_SUPER_ADMIN);
  });

  it('email null/kosong → USER', () => {
    expect(resolveRoleForNewUser(null, lists)).toBe(ROLE_USER);
    expect(resolveRoleForNewUser(undefined, lists)).toBe(ROLE_USER);
    expect(resolveRoleForNewUser('', lists)).toBe(ROLE_USER);
  });

  it('kedua list kosong → selalu USER', () => {
    const empty = { developerEmails: [], superAdminEmails: [] };
    expect(resolveRoleForNewUser('boss@desa.id', empty)).toBe(ROLE_USER);
    expect(resolveRoleForNewUser('dev@desa.id', empty)).toBe(ROLE_USER);
  });
});

describe('shouldPromoteRole', () => {
  it('USER/admin biasa → dinaikkan ke SUPER ADMIN atau DEVELOPER', () => {
    expect(shouldPromoteRole('5', ROLE_SUPER_ADMIN)).toBe(true);
    expect(shouldPromoteRole('2', ROLE_SUPER_ADMIN)).toBe(true);
    expect(shouldPromoteRole('1', ROLE_DEVELOPER)).toBe(true);
  });

  it('DEVELOPER tidak diturunkan ke SUPER ADMIN', () => {
    expect(shouldPromoteRole('0', ROLE_SUPER_ADMIN)).toBe(false);
  });

  it('role sudah sama → tidak di-update', () => {
    expect(shouldPromoteRole('1', ROLE_SUPER_ADMIN)).toBe(false);
    expect(shouldPromoteRole('0', ROLE_DEVELOPER)).toBe(false);
  });

  it('roleId null/undefined dianggap USER; custom non-numerik → dinaikkan', () => {
    expect(shouldPromoteRole(null, ROLE_SUPER_ADMIN)).toBe(true);
    expect(shouldPromoteRole(undefined, ROLE_DEVELOPER)).toBe(true);
    expect(shouldPromoteRole('custom-role', ROLE_SUPER_ADMIN)).toBe(true);
  });
});

describe('isDeveloperRole', () => {
  it('hanya roleId "0" (string atau number) = developer', () => {
    expect(isDeveloperRole('0')).toBe(true);
    expect(isDeveloperRole(0)).toBe(true);
  });

  it('super admin & role admin lain bukan developer', () => {
    for (const r of ['1', '2', '3', '4', '5', 1, 5]) {
      expect(isDeveloperRole(r)).toBe(false);
    }
  });

  it('null/undefined/kosong/non-numerik → bukan developer (fail-closed)', () => {
    expect(isDeveloperRole(null)).toBe(false);
    expect(isDeveloperRole(undefined)).toBe(false);
    expect(isDeveloperRole('')).toBe(false);
    expect(isDeveloperRole(' 0')).toBe(false);
    expect(isDeveloperRole('00')).toBe(false);
  });
});

describe('isAdminRole', () => {
  it('roleId 0-4 = admin (boleh /admin)', () => {
    for (const r of ['0', '1', '2', '3', '4']) {
      expect(isAdminRole(r)).toBe(true);
    }
  });

  it('roleId 5+ = bukan admin (login Google) → tidak boleh /admin', () => {
    expect(isAdminRole('5')).toBe(false);
    expect(isAdminRole(5)).toBe(false);
    expect(isAdminRole('9')).toBe(false);
  });

  it('roleId null/undefined default ke USER (bukan admin)', () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it('roleId non-numerik → bukan admin (fail-safe)', () => {
    expect(isAdminRole('abc')).toBe(false);
  });
});

describe('isAccountActive', () => {
  it('isActive true → aktif', () => {
    expect(isAccountActive(true)).toBe(true);
  });

  it('isActive false → nonaktif (ditolak)', () => {
    expect(isAccountActive(false)).toBe(false);
  });

  it('isActive null/undefined → dianggap aktif (default Google user aktif)', () => {
    expect(isAccountActive(null)).toBe(true);
    expect(isAccountActive(undefined)).toBe(true);
  });
});

describe('publicOriginFromHeaders', () => {
  const mk = (h: Record<string, string>) => (n: string) => h[n.toLowerCase()] ?? null;

  it('pakai X-Forwarded-* dari proxy (bukan localhost internal)', () => {
    expect(
      publicOriginFromHeaders(
        mk({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'desa-darmasaba-stg.wibudev.com' }),
      ),
    ).toBe('https://desa-darmasaba-stg.wibudev.com');
  });

  it('ambil entri pertama saat header berupa rantai proxy "a, b"', () => {
    expect(
      publicOriginFromHeaders(
        mk({ 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'public.com, localhost:3000' }),
      ),
    ).toBe('https://public.com');
  });

  it('fallback ke host header bila forwarded-host absen', () => {
    expect(publicOriginFromHeaders(mk({ host: 'example.com' }))).toBe('https://example.com');
  });

  it('default proto https bila hanya host tersedia', () => {
    expect(publicOriginFromHeaders(mk({ 'x-forwarded-host': 'a.com' }))).toBe('https://a.com');
  });
});

describe('isPublicPostPath', () => {
  it('3 form publik Inovasi + upload pengaduan → boleh POST tanpa login', () => {
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/administrasionline/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/upload')).toBe(true);
  });

  it('pinjam buku bukan form publik lagi (perpustakaan pindah ke website eksternal) → butuh login', () => {
    expect(isPublicPostPath('/api/pendidikan/perpustakaandigital/peminjamanbuku/create')).toBe(false);
    expect(isPublicPostPath('/api/pendidikan/perpustakaandigital/peminjamanbuku')).toBe(false);
  });

  it('form publik IKM / layanan surat / pendaftaran jadwal → boleh POST tanpa login', () => {
    expect(isPublicPostPath('/api/landingpage/responden/create')).toBe(true);
    expect(isPublicPostPath('/api/desa/ajukanpermohonan/create')).toBe(true);
    expect(isPublicPostPath('/api/kesehatan/pendaftaran-jadwal-kegiatan/create')).toBe(true);
    // Trailing slash / prefix parsial tetap ditolak (exact-match).
    expect(isPublicPostPath('/api/landingpage/responden/create/')).toBe(false);
    expect(isPublicPostPath('/api/desa/ajukanpermohonan')).toBe(false);
  });

  it('master data terkait form publik baru TETAP admin → tidak bocor', () => {
    // Jadwal kegiatan (master, di-CRUD admin) ≠ pendaftaran (form publik warga).
    expect(isPublicPostPath('/api/kesehatan/jadwal-kegiatan/create')).toBe(false);
    // Master data responden (jenis kelamin / umur / rating) tetap admin-only.
    expect(isPublicPostPath('/api/landingpage/jenis-kelamin-responden/create')).toBe(false);
    expect(isPublicPostPath('/api/landingpage/umur-responden/create')).toBe(false);
  });

  it('master data (jenislayanan/jenispengaduan) TETAP admin → tidak bocor', () => {
    // Bertingkat di bawah path publik; exact-match mencegah kebocoran.
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/create')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/create')).toBe(false);
  });

  it('endpoint admin lain → tidak publik', () => {
    expect(isPublicPostPath('/api/fileStorage/create')).toBe(false);
    expect(isPublicPostPath('/api/user/delete/x')).toBe(false);
    expect(isPublicPostPath('/api/role/create')).toBe(false);
  });

  it('prefix parsial / trailing slash / query → bukan match (exact only)', () => {
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create/')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create/extra')).toBe(false);
    expect(isPublicPostPath('')).toBe(false);
  });
});

describe('isPublicGetPath', () => {
  it('fileStorage/findUnique/:name → boleh GET tanpa login (serve bytes audio/dokumen)', () => {
    expect(isPublicGetPath('/api/fileStorage/findUnique/abc.mp3')).toBe(true);
    expect(isPublicGetPath('/api/fileStorage/findUnique/dokumen.pdf.gz')).toBe(true);
  });

  it('endpoint fileStorage lain TETAP admin-only', () => {
    expect(isPublicGetPath('/api/fileStorage/findMany')).toBe(false);
    expect(isPublicGetPath('/api/fileStorage')).toBe(false);
  });

  it('path admin-only lain tidak ikut terbuka', () => {
    expect(isPublicGetPath('/api/user')).toBe(false);
    expect(isPublicGetPath('/api/imgs')).toBe(false);
  });
});

describe('decideDevAccess (guard /dev di proxy & layout /dev)', () => {
  it('cache miss: token ada → allow (layout & API memvalidasi penuh), tanpa token → login', () => {
    expect(decideDevAccess(null, true)).toBe('allow');
    expect(decideDevAccess(null, false)).toBe('login');
  });

  it('developer aktif → allow (roleId string atau number)', () => {
    expect(decideDevAccess({ roleId: '0', isActive: true }, true)).toBe('allow');
    expect(decideDevAccess({ roleId: 0 }, false)).toBe('allow');
  });

  it('akun nonaktif → login, termasuk developer', () => {
    expect(decideDevAccess({ roleId: '0', isActive: false }, true)).toBe('login');
    expect(decideDevAccess({ roleId: '5', isActive: false }, true)).toBe('login');
  });

  it.each(['1', '2', '3', '4'])('role admin %s (bukan developer) → admin', (roleId) => {
    expect(decideDevAccess({ roleId, isActive: true }, true)).toBe('admin');
  });

  it('user biasa / roleId kosong → profile', () => {
    expect(decideDevAccess({ roleId: '5', isActive: true }, true)).toBe('profile');
    expect(decideDevAccess({ isActive: true }, true)).toBe('profile');
  });
});

describe('defaultRouteForRole (tujuan setelah login)', () => {
  it('developer ("0") → Developer Console /dev', () => {
    expect(DEV_HOME_PATH).toBe('/dev');
    expect(defaultRouteForRole('0')).toBe('/dev');
    expect(defaultRouteForRole(0)).toBe('/dev');
  });

  it('role admin lain tidak berubah', () => {
    expect(ADMIN_HOME_PATH).toBe('/admin/landing-page/profil/program-inovasi');
    expect(defaultRouteForRole('1')).toBe(ADMIN_HOME_PATH);
    expect(defaultRouteForRole('2')).toBe(ADMIN_HOME_PATH);
    expect(defaultRouteForRole('3')).toBe('/admin/kesehatan/posyandu/list-posyandu');
    expect(defaultRouteForRole('4')).toBe('/admin/pendidikan/info-sekolah/jenjang-pendidikan');
  });

  it('user biasa / tidak dikenal → /profile', () => {
    expect(defaultRouteForRole('5')).toBe('/profile');
    expect(defaultRouteForRole(undefined)).toBe('/profile');
    expect(defaultRouteForRole('x')).toBe('/profile');
  });
});
