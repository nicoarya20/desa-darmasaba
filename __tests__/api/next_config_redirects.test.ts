// @vitest-environment node
// Kontrak redirect permanen URL lama menu "Desa" → "Pemerintahan" dan Penghargaan → Prestasi
// Desa (next.config.ts). Matcher bawaan Next dipakai supaya perilaku test sama dengan runtime:
// /desa-anti-korupsi tidak boleh ikut ter-redirect. Prefix /darmasaba: public_route_redirects.test.ts.
import { describe, it, expect } from 'vitest';
import { loadRedirects, resolveRedirect } from '../helpers/next-redirects';

describe('next.config redirects — daftar lengkap', () => {
  it('urutan entri: spesifik sebelum wildcard, semuanya permanent', async () => {
    const redirects = await loadRedirects();
    expect(redirects.map((r) => [r.source, r.destination])).toEqual([
      ['/darmasaba/desa', '/pemerintahan'],
      ['/darmasaba/desa/:path*', '/pemerintahan/:path*'],
      ['/darmasaba/penghargaan', '/prestasi-desa'],
      ['/darmasaba/penghargaan/:id', '/prestasi-desa/:id'],
      ['/darmasaba', '/'],
      ['/darmasaba/:path*', '/:path*'],
      ['/desa', '/pemerintahan'],
      ['/desa/:path*', '/pemerintahan/:path*'],
      ['/penghargaan', '/prestasi-desa'],
      ['/penghargaan/:id', '/prestasi-desa/:id'],
      // Info Sekolah: tabel per jenjang → filter ?jenjang= (detail: info_sekolah_redirects.test.ts).
      ['/pendidikan/info-sekolah/semua/:tabel(lembaga|siswa|pengajar)', '/pendidikan/info-sekolah/:tabel'],
      ['/pendidikan/info-sekolah/:jenjang/:tabel(lembaga|siswa|pengajar)', '/pendidikan/info-sekolah/:tabel?jenjang=:jenjang'],
      // Desa Digital + Info Teknologi Tepat Guna → Inovasi Teknologi Desa (detail: inovasi_teknologi_routes.test.ts).
      ['/inovasi/desa-digital-smart-village', '/inovasi/inovasi-teknologi-desa?kategori=digital'],
      ['/inovasi/desa-digital-smart-village/:id', '/inovasi/inovasi-teknologi-desa/:id'],
      ['/inovasi/info-teknologi-tepat-guna', '/inovasi/inovasi-teknologi-desa?kategori=tepat-guna'],
      ['/admin/inovasi/desa-digital-smart-village/:path*', '/admin/inovasi/inovasi-teknologi-desa/:path*'],
      ['/admin/inovasi/info-teknologi-tepat-guna/:path*', '/admin/inovasi/inovasi-teknologi-desa/:path*'],
      ['/pendidikan/perpustakaan-digital/:path+', '/pendidikan/perpustakaan-digital'],
      ['/admin/desa', '/admin/pemerintahan'],
      ['/admin/desa/:path*', '/admin/pemerintahan/:path*'],
      ['/admin/pemerintahan/penghargaan', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
      ['/admin/pemerintahan/penghargaan/:path*', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
      // Dokumen Perencanaan: tab Kegiatan Desa → submenu Pemerintahan (detail: dokumen_perencanaan_menu.test.ts).
      ['/admin/pemerintahan/kegiatan-desa/dokumen-perencanaan/:path*', '/admin/pemerintahan/dokumen-perencanaan/:path*'],
    ]);
    expect(redirects.every((r) => r.permanent === true)).toBe(true);
  });
});

describe('next.config redirects — desa → pemerintahan', () => {
  it.each([
    ['/desa', '/pemerintahan'],
    ['/desa/berita/semua', '/pemerintahan/berita/semua'],
    ['/desa/layanan', '/pemerintahan/layanan'],
    ['/admin/desa', '/admin/pemerintahan'],
    ['/admin/desa/berita/list-berita', '/admin/pemerintahan/berita/list-berita'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it.each([
    '/desa-anti-korupsi',
    '/desa-anti-korupsi/detail/1',
    '/pemerintahan/berita',
    '/admin/desa-anti-korupsi',
    '/api/desa/berita/find-many',
  ])('%s tidak ter-redirect', async (pathname) => {
    expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
  });
});

describe('next.config redirects — penghargaan digabung ke prestasi desa', () => {
  it.each([
    ['/penghargaan', '/prestasi-desa'],
    ['/penghargaan/cmkal9dd70002vnexhvn4j2fv', '/prestasi-desa/cmkal9dd70002vnexhvn4j2fv'],
    ['/admin/pemerintahan/penghargaan', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
    ['/admin/pemerintahan/penghargaan/create', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
    ['/admin/pemerintahan/penghargaan/abc/edit', '/admin/landing-page/prestasi-desa/list-prestasi-desa'],
  ])('%s → %s', async (from, to) => {
    expect(resolveRedirect(await loadRedirects(), from)).toBe(to);
  });

  it.each(['/prestasi-desa', '/prestasi-desa/abc', '/penghargaan/a/b'])(
    '%s tidak ter-redirect',
    async (pathname) => {
      expect(resolveRedirect(await loadRedirects(), pathname)).toBeNull();
    },
  );
});
