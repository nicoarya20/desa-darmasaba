// @vitest-environment node
// Kerangka aplikasi Musik Desa: sidebar kiri, pil tab, kolom cari, dan pertukaran bar pemutar di shell situs.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & media query tidak jalan di server).
import { createTheme, MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ pathname: '/musik/musik-desa', search: '' }));
const music = vi.hoisted(() => ({ currentSong: null as { id: string } | null }));

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
vi.mock('@/app/(public)/_com/now-playing/NowPlayingWidget', () => ({
  NowPlayingWidget: () => <div data-testid="now-playing-widget" />,
}));
vi.mock('@/app/(public)/_com/ImageErrorRetryMount', () => ({ ImageErrorRetry: () => null }));
// Pemutar (Sesi C) diganti penanda: yang diuji di sini hanya penempatannya di grid aplikasi.
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/player/NowPlayingBar', () => ({
  NowPlayingBar: () => <div data-testid="now-playing-bar" />,
}));
// Hanya `currentSong` yang dibaca MusikApp (penentu ruang bar pemutar).
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => music }));
vi.mock('@/app/(public)/(pages)/musik/musik-desa/_com/player/QueuePanel', () => ({
  QueuePanel: () => <div data-testid="queue-panel" />,
}));

import { DarmasabaShell } from '@/app/(public)/_com/DarmasabaShell';
import { MusikApp, QueueDrawer, queueDrawerTransition } from '@/app/(public)/(pages)/musik/musik-desa/_com/app/MusikApp';
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
  music.currentSong = null;
});

describe('MusikSidebar', () => {
  it('tanpa baris merek; tiga menu bertaut, dan hanya menu aktif yang aria-current', () => {
    nav.pathname = '/musik/musik-desa/jelajahi';
    const html = render(<MusikSidebar />);
    expect(text(html)).not.toContain('Musik Desa');
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

  it('tanpa landmark aside & tanpa heading (h1 halaman jadi heading pertama); nav tetap berlabel', () => {
    const html = render(<MusikSidebar />);
    expect(html).not.toMatch(/<aside|<section|<h[1-6]/);
    expect(html).toContain(`<nav aria-label="${T.navLabel}"`);
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
  it.each(['/musik/musik-desa', '/musik/musik-desa/jelajahi'])('di %s tanpa footer situs & widget Now Playing', (path) => {
    nav.pathname = path;
    const html = render(<DarmasabaShell>isi</DarmasabaShell>);
    expect(html).toContain('navbar');
    expect(text(html)).toContain('isi');
    expect(html).not.toContain('data-testid="footer"');
    expect(html).not.toContain('now-playing-widget');
  });

  it('halaman lain tetap memakai footer dan widget Now Playing', () => {
    nav.pathname = '/pemerintahan/berita/semua';
    const html = render(<DarmasabaShell>isi</DarmasabaShell>);
    expect(html).toContain('data-testid="footer"');
    expect(html).toContain('now-playing-widget');
  });

  it.each(['/musikal', '/musik', '/musik/xyz'])('%s bukan aplikasi musik: footer & widget Now Playing tetap ada', (path) => {
    nav.pathname = path;
    const html = render(<DarmasabaShell>isi</DarmasabaShell>);
    expect(html).toContain('data-testid="footer"');
    expect(html).toContain('now-playing-widget');
  });
});

describe('MusikApp', () => {
  it('sidebar, pil tab, kolom cari, konten main, dan satu bar pemutar', () => {
    const html = render(
      <MusikApp>
        <h1>Musik Desa</h1>
      </MusikApp>,
    );
    expect(html).toMatch(/<div[^>]*class="[^"]*sidebar/);
    expect(html).toMatch(/<nav[^>]*class="[^"]*pills/);
    expect(html).toContain('role="search"');
    expect(html).toMatch(/<main[^>]*><h1>Musik Desa<\/h1><\/main>/);
    expect(html.match(/now-playing-bar/g)).toHaveLength(1);
  });

  it('belum ada lagu dipilih → data-bar="off" (tanpa ruang bar); ada lagu (walau dijeda) → "on"', () => {
    expect(render(<MusikApp>isi</MusikApp>)).toContain('data-bar="off"');
    music.currentSong = { id: 'lagu-1' };
    expect(render(<MusikApp>isi</MusikApp>)).toContain('data-bar="on"');
  });

  it('tanpa bar pemutar: tombol Antrean cadangan di topbar (aria-expanded false, aria-controls ke panel)', () => {
    const html = render(<MusikApp>isi</MusikApp>);
    const button = html.match(new RegExp(`<button[^>]*aria-label="${T.queueOpen}"[^>]*>`))?.[0] ?? '';
    expect(button).toContain('aria-expanded="false"');
    const controls = button.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controls).toBeTruthy();
    // Tombol berada di topbar, setelah form cari.
    expect(html.indexOf('role="search"')).toBeLessThan(html.indexOf(`aria-label="${T.queueOpen}"`));
  });

  it('bar pemutar ada → tombol cadangan topbar tidak dirender (tombol Antrean di bar dipakai)', () => {
    music.currentSong = { id: 'lagu-1' };
    expect(render(<MusikApp>isi</MusikApp>)).not.toContain(`aria-label="${T.queueOpen}"`);
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
        <QueueDrawer opened sheet={sheet} onClose={() => {}} panelId="antrean-panel" />
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

  it('dialog membawa id panel (tujuan aria-controls tombol Antrean)', () => {
    expect(renderDrawer(false)).toMatch(/<section[^>]*id="antrean-panel"[^>]*role="dialog"|<section[^>]*role="dialog"[^>]*id="antrean-panel"/);
  });

  it('prefers-reduced-motion → transisi Drawer durasi 0; selain itu bawaan Mantine', () => {
    expect(queueDrawerTransition(true)).toEqual({ duration: 0 });
    expect(queueDrawerTransition(false)).toBeUndefined();
  });
});
