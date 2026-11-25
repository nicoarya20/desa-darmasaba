// @vitest-environment node
// Kerangka aplikasi Musik Desa: menu aktif dari pathname, rute bar pemutar, URL cari Jelajahi, status awal antrean.
import { describe, expect, it } from 'vitest';
import {
  activeMusikNav,
  keepsPendingSearch,
  musikSearchHref,
  musikSearchNavigation,
  reconcileSentQ,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.logic';
import { readFileSync } from 'node:fs';
import { isMusikAppPath } from '@/app/(public)/_com/musik-route';
import {
  MUSIK_COMPACT_MAX_PX,
  MUSIK_QUEUE_COLUMN_MIN_PX,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-layout';
import { MUSIK_NAV_ITEMS } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.meta';
import {
  parseQueueOpen,
  queueFocusTarget,
  queueOpenForViewport,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-ui.context';

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
  it('hanya /musik/musik-desa dan turunannya memakai bar pemutar aplikasi', () => {
    expect(isMusikAppPath('/musik/musik-desa')).toBe(true);
    expect(isMusikAppPath('/musik/musik-desa/')).toBe(true);
    expect(isMusikAppPath('/musik/musik-desa/jelajahi')).toBe(true);
  });

  it('/musik dan /musik/<lain> (404) tetap memakai shell situs, termasuk awalan mirip', () => {
    expect(isMusikAppPath('/musik')).toBe(false);
    expect(isMusikAppPath('/musik/xyz')).toBe(false);
    expect(isMusikAppPath('/musik/musik-desa-lama')).toBe(false);
  });

  it('halaman lain tetap memakai widget Now Playing situs, termasuk awalan teks mirip', () => {
    expect(isMusikAppPath('/')).toBe(false);
    expect(isMusikAppPath('/musikal')).toBe(false);
    expect(isMusikAppPath('/pendidikan/musik')).toBe(false);
    expect(isMusikAppPath(null)).toBe(false);
  });
});

describe('breakpoint kerangka (musik-layout.ts ↔ musik-app.module.css)', () => {
  // CSS modul tidak bisa mengimpor konstanta JS; test ini menjaga angka di @media tetap sama.
  const css = readFileSync('src/app/(public)/(pages)/musik/musik-desa/_com/app/musik-app.module.css', 'utf8');

  it('media query ringkas CSS = MUSIK_COMPACT_MAX_PX', () => {
    expect(css).toContain(`@media (max-width: ${MUSIK_COMPACT_MAX_PX}px)`);
  });

  it('kolom antrean dimulai tepat setelah lebar ringkas', () => {
    expect(MUSIK_QUEUE_COLUMN_MIN_PX).toBeGreaterThan(MUSIK_COMPACT_MAX_PX);
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

describe('musikSearchNavigation (lokasi hidup saat timer berbunyi)', () => {
  it('di Jelajahi: replace dan genre/artis dari search hidup dipertahankan', () => {
    // genre=jazz dipilih selama jeda ketik: ada di window.location.search, belum di searchParams render lama.
    expect(musikSearchNavigation('gong', '/musik/musik-desa/jelajahi', '?genre=jazz&artis=kadek')).toEqual({
      href: '/musik/musik-desa/jelajahi?genre=jazz&artis=kadek&q=gong',
      mode: 'replace',
    });
  });

  it('dari menu lain: push hanya dengan q; parameter halaman itu tidak terbawa', () => {
    expect(musikSearchNavigation(' gong ', '/musik/musik-desa', '?x=1')).toEqual({
      href: '/musik/musik-desa/jelajahi?q=gong',
      mode: 'push',
    });
  });

  it('dari menu lain dengan kata kosong tidak menavigasi; di Jelajahi kata kosong menghapus q', () => {
    expect(musikSearchNavigation('  ', '/musik/musik-desa/playlist', '')).toBeNull();
    expect(musikSearchNavigation('', '/musik/musik-desa/jelajahi', '?q=lama&genre=pop')).toEqual({
      href: '/musik/musik-desa/jelajahi?genre=pop',
      mode: 'replace',
    });
  });
});

describe('reconcileSentQ (gema kiriman sendiri vs perubahan dari luar)', () => {
  it('URL menyusul kiriman lama saat pengunjung terus mengetik → ketikan tidak ditimpa', () => {
    // Terkirim "gam" lalu "gamelan"; URL baru sampai di "gam".
    expect(reconcileSentQ(['gam', 'gamelan'], 'gam')).toEqual({ sent: ['gamelan'], adopt: false });
    expect(reconcileSentQ(['gamelan'], 'gamelan')).toEqual({ sent: [], adopt: false });
  });

  it('kiriman antara yang terlewat ikut dibuang', () => {
    expect(reconcileSentQ(['g', 'ga', 'gam'], 'ga')).toEqual({ sent: ['gam'], adopt: false });
  });

  it('perubahan dari luar (mundur, Hapus filter) diadopsi dan antrean kiriman dikosongkan', () => {
    expect(reconcileSentQ(['gamelan'], '')).toEqual({ sent: [], adopt: true });
    expect(reconcileSentQ([], 'lama')).toEqual({ sent: [], adopt: true });
  });
});

describe('keepsPendingSearch (batal jeda saat pindah menu)', () => {
  it('hanya Jelajahi yang mempertahankan ketikan yang menunggu', () => {
    expect(keepsPendingSearch('/musik/musik-desa/jelajahi')).toBe(true);
    expect(keepsPendingSearch('/musik/musik-desa/playlist')).toBe(false);
    expect(keepsPendingSearch('/musik/musik-desa')).toBe(false);
    expect(keepsPendingSearch(null)).toBe(false);
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

describe('fokus setelah antrean ditutup', () => {
  it('tombol Antrean di bar diutamakan; tanpa bar → tombol cadangan topbar', () => {
    expect(queueFocusTarget('bar', 'topbar')).toBe('bar');
    expect(queueFocusTarget(null, 'topbar')).toBe('topbar');
    expect(queueFocusTarget(null, null)).toBeNull();
  });
});
