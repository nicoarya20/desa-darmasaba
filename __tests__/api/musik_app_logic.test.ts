// @vitest-environment node
// Kerangka aplikasi Musik Desa: menu aktif dari pathname, rute bar pemutar, URL cari Jelajahi, status awal antrean.
import { describe, expect, it } from 'vitest';
import {
  activeMusikNav,
  isMusikAppPath,
  musikSearchHref,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.logic';
import { MUSIK_NAV_ITEMS } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.meta';
import { queueOpenForViewport, parseQueueOpen } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-ui.context';

describe('activeMusikNav', () => {
  it('akar aplikasi = Musik, dengan atau tanpa garis miring akhir', () => {
    expect(activeMusikNav('/musik/musik-desa')).toBe('musik');
    expect(activeMusikNav('/musik/musik-desa/')).toBe('musik');
  });

  it('Jelajahi & Playlist termasuk sub-rutenya', () => {
    expect(activeMusikNav('/musik/musik-desa/jelajahi')).toBe('jelajahi');
    expect(activeMusikNav('/musik/musik-desa/playlist')).toBe('playlist');
    expect(activeMusikNav('/musik/musik-desa/playlist/abc')).toBe('playlist');
  });

  it('awalan mirip atau rute lain tidak dianggap menu', () => {
    expect(activeMusikNav('/musik/musik-desa/jelajahi-lain')).toBeNull();
    expect(activeMusikNav('/musik/musik-desa-lama')).toBeNull();
    expect(activeMusikNav('/pemerintahan/berita/semua')).toBeNull();
    expect(activeMusikNav(null)).toBeNull();
  });

  it('urutan menu Musik → Jelajahi → Playlist', () => {
    expect(MUSIK_NAV_ITEMS.map((item) => item.label)).toEqual(['Musik', 'Jelajahi', 'Playlist']);
  });
});

describe('isMusikAppPath', () => {
  it('/musik dan turunannya memakai bar pemutar aplikasi', () => {
    expect(isMusikAppPath('/musik')).toBe(true);
    expect(isMusikAppPath('/musik/musik-desa')).toBe(true);
    expect(isMusikAppPath('/musik/musik-desa/jelajahi')).toBe(true);
  });

  it('halaman lain tetap memakai FixedPlayerBar, termasuk awalan teks mirip', () => {
    expect(isMusikAppPath('/')).toBe(false);
    expect(isMusikAppPath('/musikal')).toBe(false);
    expect(isMusikAppPath('/pendidikan/musik')).toBe(false);
    expect(isMusikAppPath(null)).toBe(false);
  });
});

describe('musikSearchHref', () => {
  it('dari menu lain → Jelajahi hanya dengan q (dirapikan, di-encode)', () => {
    expect(musikSearchHref('  gamelan bali ', null)).toBe('/musik/musik-desa/jelajahi?q=gamelan+bali');
    expect(musikSearchHref('a&b', null)).toBe('/musik/musik-desa/jelajahi?q=a%26b');
  });

  it('di Jelajahi genre & artis dipertahankan, q diganti', () => {
    const current = new URLSearchParams('genre=pop&q=lama&artis=kadek');
    expect(musikSearchHref('baru', current)).toBe('/musik/musik-desa/jelajahi?genre=pop&q=baru&artis=kadek');
  });

  it('kata kosong / spasi saja menghapus q', () => {
    expect(musikSearchHref('   ', new URLSearchParams('q=lama&genre=jazz'))).toBe('/musik/musik-desa/jelajahi?genre=jazz');
    expect(musikSearchHref('', new URLSearchParams('q=lama'))).toBe('/musik/musik-desa/jelajahi');
  });

  it('tidak mengubah objek parameter milik pemanggil', () => {
    const current = new URLSearchParams('q=lama');
    musikSearchHref('baru', current);
    expect(current.get('q')).toBe('lama');
  });
});

describe('status awal panel Antrean', () => {
  it('nilai tersimpan "1"/"0" terbaca, lainnya (kosong/rusak) → null', () => {
    expect(parseQueueOpen('1')).toBe(true);
    expect(parseQueueOpen('0')).toBe(false);
    expect(parseQueueOpen(null)).toBeNull();
    expect(parseQueueOpen('true')).toBeNull();
  });

  it('≥1280px: bawaan terbuka, preferensi tersimpan dihormati', () => {
    expect(queueOpenForViewport(true, null)).toBe(true);
    expect(queueOpenForViewport(true, false)).toBe(false);
    expect(queueOpenForViewport(true, true)).toBe(true);
  });

  it('<1280px (Drawer) selalu mulai tertutup walau preferensi terbuka', () => {
    expect(queueOpenForViewport(false, null)).toBe(false);
    expect(queueOpenForViewport(false, true)).toBe(false);
  });
});
