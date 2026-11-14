// @vitest-environment node
// Kerangka aplikasi Musik Desa: sidebar kiri, pil tab, kolom cari, dan pertukaran bar pemutar di shell situs.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & media query tidak jalan di server).
import { createTheme, MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ pathname: '/musik/musik-desa', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
// Shell situs: bagian berat diganti penanda supaya yang diuji hanya pilihan bar pemutar.
vi.mock('@/app/(public)/_com/Navbar', () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock('@/app/(public)/_com/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/app/(public)/_com/FixedPlayerBar', () => ({ default: () => <div data-testid="fixed-player-bar" /> }));
vi.mock('@/app/(public)/_com/ImageErrorRetryMount', () => ({ ImageErrorRetry: () => null }));
// Pemutar (Sesi C) diganti penanda: yang diuji di sini hanya penempatannya di grid aplikasi.
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/player/NowPlayingBar', () => ({
  NowPlayingBar: () => <div data-testid="now-playing-bar" />,
}));
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/player/QueuePanel', () => ({
  QueuePanel: () => <div data-testid="queue-panel" />,
}));

import { DarmasabaShell } from '@/app/(public)/_com/DarmasabaShell';
import { MusikApp, QueueDrawer } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/MusikApp';
import { MusikNavPills, MusikSidebar } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/MusikSidebar';
import { MusikTopbar } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/MusikTopbar';
import { MUSIK_APP_TEXT as T } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.meta';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const currentLinks = (html: string) => [...html.matchAll(/<a[^>]*aria-current="page"[^>]*>(.*?)<\/a>/g)].map((m) => text(m[1]).trim());

beforeEach(() => {
  nav.pathname = '/musik/musik-desa';
  nav.search = '';
});

describe('MusikSidebar', () => {
  it('merek, tiga menu bertaut, dan hanya menu aktif yang aria-current', () => {
    nav.pathname = '/musik/musik-desa/jelajahi';
    const html = render(<MusikSidebar />);
    expect(text(html)).toContain(T.brand);
    expect(html).toContain('href="/musik/musik-desa"');
    expect(html).toContain('href="/musik/musik-desa/jelajahi"');
    expect(html).toContain('href="/musik/musik-desa/playlist"');
    expect(currentLinks(html)).toEqual(['Jelajahi']);
  });

  it('slot playlist admin tampil kosong, tanpa tombol buat playlist', () => {
    const out = text(render(<MusikSidebar />));
    expect(out).toContain(T.playlistHeading);
    expect(out).toContain(T.playlistEmpty);
    expect(out).not.toMatch(/buat playlist/i);
  });

  it('di luar menu aplikasi tidak ada menu aktif', () => {
    nav.pathname = '/musik/musik-desa/lain';
    expect(currentLinks(render(<MusikSidebar />))).toEqual([]);
  });
});

describe('MusikNavPills', () => {
  it('pil tab mengikuti menu aktif', () => {
    nav.pathname = '/musik/musik-desa/playlist';
    const html = render(<MusikNavPills />);
    expect(html).toContain(`aria-label="${T.navLabel}"`);
    expect(currentLinks(html)).toEqual(['Playlist']);
  });
});

describe('MusikTopbar', () => {
  it('kolom cari berlabel dengan placeholder Indonesia', () => {
    const html = render(<MusikTopbar />);
    expect(html).toContain('role="search"');
    expect(html).toContain('type="search"');
    expect(html).toContain(`placeholder="${T.searchPlaceholder}"`);
    expect(html).toMatch(new RegExp(`<label[^>]*for="musik-search"[^>]*>${T.searchLabel}</label>`));
  });

  it('di Jelajahi nilai awal diambil dari ?q=', () => {
    nav.pathname = '/musik/musik-desa/jelajahi';
    nav.search = 'q=gamelan&genre=pop';
    expect(render(<MusikTopbar />)).toContain('value="gamelan"');
  });

  it('di menu lain ?q= diabaikan (kolom kosong)', () => {
    nav.search = 'q=gamelan';
    expect(render(<MusikTopbar />)).toContain('value=""');
  });
});

describe('DarmasabaShell', () => {
  it('di rute musik FixedPlayerBar diganti spasi setelah footer', () => {
    nav.pathname = '/musik/musik-desa/jelajahi';
    const html = render(<DarmasabaShell>isi</DarmasabaShell>);
    expect(html).not.toContain('fixed-player-bar');
    expect(html).toMatch(/data-testid="footer"[^]*<div[^>]*class="[^"]*playerSpacer[^"]*"[^>]*aria-hidden="true"/);
  });

  it('halaman lain tetap memakai FixedPlayerBar tanpa spasi tambahan', () => {
    nav.pathname = '/pemerintahan/berita/semua';
    const html = render(<DarmasabaShell>isi</DarmasabaShell>);
    expect(html).toContain('fixed-player-bar');
    expect(html).not.toContain('playerSpacer');
  });
});

describe('MusikApp', () => {
  it('sidebar, pil tab, kolom cari, konten main, dan satu bar pemutar', () => {
    const html = render(
      <MusikApp>
        <h1>Musik Desa</h1>
      </MusikApp>,
    );
    expect(html).toMatch(/<aside[^>]*class="[^"]*sidebar/);
    expect(html).toMatch(/<nav[^>]*class="[^"]*pills/);
    expect(html).toContain('role="search"');
    expect(html).toMatch(/<main[^>]*><h1>Musik Desa<\/h1><\/main>/);
    expect(html.match(/now-playing-bar/g)).toHaveLength(1);
  });

  it('render server: antrean tertutup (kolom kanan & Drawer belum ada) sampai status dibaca setelah mount', () => {
    const html = render(<MusikApp>isi</MusikApp>);
    expect(html).toContain('data-queue="false"');
    expect(html).not.toContain('queue-panel');
  });
});

describe('QueueDrawer', () => {
  // Portal Mantine baru terpasang setelah mount → di server Drawer dirender di tempat.
  const theme = createTheme({ components: { DrawerRoot: { defaultProps: { withinPortal: false } } } });
  const renderDrawer = (sheet: boolean) =>
    renderToStaticMarkup(
      <MantineProvider theme={theme}>
        <QueueDrawer opened sheet={sheet} onClose={() => {}} />
      </MantineProvider>,
    ).replace(/<style[\s\S]*?<\/style>/g, '');
  const classOf = (html: string, marker: string) => html.match(new RegExp(`class="([^"]*${marker}[^"]*)"`))?.[1] ?? '';

  it.each([false, true])('latar hanya di elemen content, bukan inner selebar layar (sheet=%s)', (sheet) => {
    const html = renderDrawer(sheet);
    expect(html).toContain('queue-panel');
    expect(classOf(html, 'mantine-Drawer-content')).toMatch(/drawerContent/);
    expect(classOf(html, 'mantine-Drawer-inner')).toContain('mantine-Drawer-inner');
    expect(classOf(html, 'mantine-Drawer-inner')).not.toMatch(/drawerContent|drawerSheet/);
    expect(classOf(html, 'mantine-Drawer-body')).toMatch(/drawerBody/);
  });

  it('lembar bawah diberi kelas sudut bulat, Drawer kanan tidak', () => {
    expect(classOf(renderDrawer(true), 'mantine-Drawer-content')).toMatch(/drawerSheet/);
    expect(classOf(renderDrawer(false), 'mantine-Drawer-content')).not.toMatch(/drawerSheet/);
  });

  it('dialog berlabel Antrean', () => {
    expect(renderDrawer(false)).toMatch(/role="dialog"[^>]*aria-label="Antrean"|aria-label="Antrean"[^>]*role="dialog"/);
  });
});
