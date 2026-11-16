// @vitest-environment node
// Info Sekolah: tautan lama (dibagikan warga, terindeks mesin pencari) wajib permanen ke tujuan baru dan tidak boleh
// menangkap rute baru. Sejak rombak 2026-11-15: /lembaga → panel #lembaga halaman utama, /siswa → halaman utama
// (nama siswa tidak lagi publik), /pengajar tetap daftar.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { matchesRealPage, publicRoutes } from '../helpers/darmasaba-routes';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';
import JenjangPage from '@/app/(public)/(pages)/pendidikan/info-sekolah/[jenjangPendidikan]/page';
import LembagaPage from '@/app/(public)/(pages)/pendidikan/info-sekolah/lembaga/page';
import SiswaPage from '@/app/(public)/(pages)/pendidikan/info-sekolah/siswa/page';

const redirectTo = vi.hoisted(() => vi.fn((url: string): never => {
  throw new Error(`REDIRECT:${url}`);
}));
vi.mock('next/navigation', () => ({ permanentRedirect: redirectTo }));

const PAGE_DIR = path.resolve(__dirname, '../../src/app/(public)/(pages)/pendidikan/info-sekolah');

describe('redirect Info Sekolah (next.config)', () => {
  it.each([
    ['/pendidikan/info-sekolah/semua/lembaga', '/pendidikan/info-sekolah/lembaga'],
    ['/pendidikan/info-sekolah/semua/siswa', '/pendidikan/info-sekolah/siswa'],
    ['/pendidikan/info-sekolah/semua/pengajar', '/pendidikan/info-sekolah/pengajar'],
    ['/pendidikan/info-sekolah/sd/lembaga', '/pendidikan/info-sekolah/lembaga?jenjang=sd'],
    ['/pendidikan/info-sekolah/smp/siswa', '/pendidikan/info-sekolah/siswa?jenjang=smp'],
    ['/pendidikan/info-sekolah/paud/pengajar', '/pendidikan/info-sekolah/pengajar?jenjang=paud'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it('semua entri permanent', async () => {
    const mine = (await loadRedirects()).filter((r) => r.source.startsWith('/pendidikan/info-sekolah'));
    expect(mine).toHaveLength(2);
    for (const r of mine) expect(r.permanent).toBe(true);
  });

  it.each(['/pendidikan/info-sekolah', '/pendidikan/info-sekolah/lembaga', '/pendidikan/info-sekolah/siswa', '/pendidikan/info-sekolah/pengajar'])(
    'rute %s tidak ditangkap next.config',
    async (pathname) => {
      expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
    },
  );
});

describe('redirect halaman /lembaga & /siswa (page)', () => {
  it.each([
    ['lembaga', LembagaPage, '/pendidikan/info-sekolah#lembaga'],
    ['siswa', SiswaPage, '/pendidikan/info-sekolah'],
    ['{jenjang}', JenjangPage, '/pendidikan/info-sekolah'],
  ])('/%s → %s (permanen)', (_name, Page, to) => {
    expect(() => Page()).toThrow(`REDIRECT:${to}`);
  });
});

describe('rute Info Sekolah di file system', () => {
  it('halaman utama, pengajar, dan rute lama punya page', () => {
    const routes = publicRoutes();
    for (const p of ['/pendidikan/info-sekolah', '/pendidikan/info-sekolah/lembaga', '/pendidikan/info-sekolah/siswa', '/pendidikan/info-sekolah/pengajar']) {
      expect(matchesRealPage(p, routes), p).toBe(true);
    }
  });

  it('sisa rute lama (semua/, tabel per jenjang) sudah dihapus; /{jenjang} satu segmen hanya redirect', () => {
    expect(existsSync(path.join(PAGE_DIR, 'semua'))).toBe(false);
    expect(existsSync(path.join(PAGE_DIR, '_lib'))).toBe(false);
    for (const f of ['content.tsx', 'lembaga', 'siswa', 'pengajar']) {
      expect(existsSync(path.join(PAGE_DIR, '[jenjangPendidikan]', f)), f).toBe(false);
    }
  });

  it('tidak ada kode halaman publik yang meminta daftar siswa (nama anak) atau memakai state admin', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(name)) files.push(full);
      }
    };
    walk(PAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src, file).not.toMatch(/siswa\/find-many|\.siswa\.findMany|infosekolahpaud\.siswa/);
      expect(src, file).not.toContain('_state/pendidikan');
    }
  });
});
