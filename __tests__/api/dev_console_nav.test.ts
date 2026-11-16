// @vitest-environment node
// Navigasi Developer Console: item aktif, grup Jenna, dan penjaga draf belum disimpan.
import { describe, expect, it } from 'vitest';
import {
  DEV_NAV,
  isDevNavActive,
  isDevNavGroup,
  isDevNavGroupActive,
  openActiveGroups,
  type DevNavGroup,
  type DevNavLink,
} from '@/app/dev/_com/dev-nav';
import { hasDirtySection, isNewTabClick, shouldConfirmLeave } from '@/app/dev/_com/leave-guard.logic';
import { JENNA_PAGES, jennaPageMeta } from '@/app/dev/jenna/jenna-pages';

const jenna = DEV_NAV.find((e): e is DevNavGroup => isDevNavGroup(e) && e.basePath === '/dev/jenna')!;
const ringkasan = DEV_NAV.find((e): e is DevNavLink => !isDevNavGroup(e) && e.href === '/dev/ringkasan')!;
const child = (href: string) => jenna.children.find((c) => c.href === href)!;

const activeHrefs = (pathname: string) =>
  DEV_NAV.flatMap((e) => (isDevNavGroup(e) ? e.children : [e]))
    .filter((item) => isDevNavActive(pathname, item))
    .map((item) => item.href);

describe('DEV_NAV', () => {
  it('Ringkasan Sistem lalu grup Jenna berisi Umum, Batas Pemakaian, Log Error, Pengetahuan, Penggunaan, Percakapan, Provider, Suara', () => {
    expect(DEV_NAV.map((e) => e.label)).toEqual(['Ringkasan Sistem', 'Jenna']);
    expect(jenna.children.map((c) => [c.label, c.href])).toEqual([
      ['Umum', '/dev/jenna'],
      ['Batas Pemakaian', '/dev/jenna/batas'],
      ['Log Error', '/dev/jenna/log-error'],
      ['Pengetahuan', '/dev/jenna/pengetahuan'],
      ['Penggunaan', '/dev/jenna/penggunaan'],
      ['Percakapan', '/dev/jenna/percakapan'],
      ['Provider', '/dev/jenna/provider'],
      ['Suara', '/dev/jenna/suara'],
    ]);
  });

  it('setiap item punya ikon', () => {
    for (const e of DEV_NAV) {
      expect(e.icon).toBeTruthy();
      if (isDevNavGroup(e)) for (const c of e.children) expect(c.icon).toBeTruthy();
    }
  });

  it('setiap halaman Jenna di nav punya judul header sendiri', () => {
    for (const c of jenna.children) expect(JENNA_PAGES[c.href]?.title).toBeTruthy();
    expect(new Set(jenna.children.map((c) => jennaPageMeta(c.href).title)).size).toBe(jenna.children.length);
  });
});

describe('isDevNavActive', () => {
  it('Umum aktif hanya di /dev/jenna persis', () => {
    expect(isDevNavActive('/dev/jenna', child('/dev/jenna'))).toBe(true);
    expect(isDevNavActive('/dev/jenna/batas', child('/dev/jenna'))).toBe(false);
    expect(isDevNavActive('/dev/jenna/provider', child('/dev/jenna'))).toBe(false);
    expect(isDevNavActive('/dev/jenna/percakapan', child('/dev/jenna'))).toBe(false);
  });

  it('tepat satu item aktif di tiap halaman', () => {
    expect(activeHrefs('/dev/jenna')).toEqual(['/dev/jenna']);
    expect(activeHrefs('/dev/jenna/batas')).toEqual(['/dev/jenna/batas']);
    expect(activeHrefs('/dev/jenna/provider')).toEqual(['/dev/jenna/provider']);
    expect(activeHrefs('/dev/jenna/percakapan')).toEqual(['/dev/jenna/percakapan']);
    expect(activeHrefs('/dev/jenna/pengetahuan')).toEqual(['/dev/jenna/pengetahuan']);
    expect(activeHrefs('/dev/jenna/penggunaan')).toEqual(['/dev/jenna/penggunaan']);
    expect(activeHrefs('/dev/jenna/log-error')).toEqual(['/dev/jenna/log-error']);
    expect(activeHrefs('/dev/jenna/suara')).toEqual(['/dev/jenna/suara']);
    expect(activeHrefs('/dev/ringkasan')).toEqual(['/dev/ringkasan']);
  });

  it('Ringkasan tetap aktif untuk sub-path, bukan prefix mentah', () => {
    expect(isDevNavActive('/dev/ringkasan/detail', ringkasan)).toBe(true);
    expect(isDevNavActive('/dev/ringkasanx', ringkasan)).toBe(false);
    expect(isDevNavActive('/dev/jenna/provider/x', child('/dev/jenna/provider'))).toBe(true);
  });
});

describe('grup Jenna', () => {
  it.each(['/dev/jenna', '/dev/jenna/batas', '/dev/jenna/percakapan', '/dev/jenna/provider'])('aktif di %s', (path) => {
    expect(isDevNavGroupActive(path, jenna)).toBe(true);
  });

  it.each(['/dev/ringkasan', '/dev/jennax', '/dev'])('tidak aktif di %s', (path) => {
    expect(isDevNavGroupActive(path, jenna)).toBe(false);
  });

  it('terbuka otomatis saat masuk /dev/jenna/*, tertutup di halaman lain', () => {
    expect(openActiveGroups({}, '/dev/jenna/batas')).toEqual({ '/dev/jenna': true });
    expect(openActiveGroups({}, '/dev/ringkasan')).toEqual({});
  });

  it('pilihan buka/tutup pengguna dipertahankan di luar grup; masuk grup membukanya lagi', () => {
    expect(openActiveGroups({ '/dev/jenna': true }, '/dev/ringkasan')).toEqual({ '/dev/jenna': true });
    expect(openActiveGroups({ '/dev/jenna': false }, '/dev/ringkasan')).toEqual({ '/dev/jenna': false });
    expect(openActiveGroups({ '/dev/jenna': false }, '/dev/jenna/provider')).toEqual({ '/dev/jenna': true });
  });

  it('tidak mengubah objek masukan', () => {
    const open = { '/dev/jenna': false };
    openActiveGroups(open, '/dev/jenna');
    expect(open).toEqual({ '/dev/jenna': false });
  });
});

describe('penjaga draf belum disimpan', () => {
  it('hasDirtySection: true bila ada satu bagian dirty', () => {
    expect(hasDirtySection({})).toBe(false);
    expect(hasDirtySection({ identity: false, limits: false })).toBe(false);
    expect(hasDirtySection({ identity: false, chat_openai: true })).toBe(true);
  });

  it('konfirmasi hanya bila ada draf dan tujuan berbeda dari halaman ini', () => {
    expect(shouldConfirmLeave('/dev/jenna', '/dev/jenna/batas', true)).toBe(true);
    expect(shouldConfirmLeave('/dev/jenna/provider', '/admin/landing-page/profil/program-inovasi', true)).toBe(true);
    expect(shouldConfirmLeave('/dev/jenna/provider', '/', true)).toBe(true);
    expect(shouldConfirmLeave('/dev/jenna', '/dev/jenna', true)).toBe(false);
    expect(shouldConfirmLeave('/dev/jenna', '/dev/jenna/batas', false)).toBe(false);
  });

  it('klik ke tab baru (tombol tengah / modifier) tidak ditahan', () => {
    const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
    expect(isNewTabClick(click)).toBe(false);
    expect(isNewTabClick({ ...click, button: 1 })).toBe(true);
    expect(isNewTabClick({ ...click, metaKey: true })).toBe(true);
    expect(isNewTabClick({ ...click, ctrlKey: true })).toBe(true);
    expect(isNewTabClick({ ...click, shiftKey: true })).toBe(true);
    expect(isNewTabClick({ ...click, altKey: true })).toBe(true);
  });
});
