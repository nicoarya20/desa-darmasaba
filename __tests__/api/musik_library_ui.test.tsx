// @vitest-environment node
// Isi halaman Musik Desa: beranda (rak), Jelajahi (filter + tabel), Playlist (kosong).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; klik/gulir diverifikasi manual.
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import {
  ARTIS_LIMIT,
  GENRE_LIMIT,
  MusikHomeView,
  SEMUA_LIMIT,
  TERBARU_LIMIT,
} from '@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikHome';
import { MusikJelajahiView } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikJelajahi';
import { MusikPlaylist } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikPlaylist';
import { MusikLoadError } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/MusikLoadError';
import { deriveArtists, deriveGenres, toTrack, withGenreLabels } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.logic';
import { parseJelajahiParams } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-jelajahi.logic';
import { MUSIK_TEXT as T } from '@/app/(public)/(pages)/musik/musik-desa/_com/library/musik-library.text';
import row from '@/app/(public)/(pages)/musik/musik-desa/_com/library/track-row.module.css';

const render = (node: ReactElement) => renderToStaticMarkup(node);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const h2s = (html: string) => [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]));
const noop = () => {};

// test-only: 3 lagu, 1 tanpa audio & sampul, genre "Pop"/"pop".
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'x', link });
const musik = (id: string, over: Partial<Musik> = {}): Musik => ({
  id,
  judul: `Lagu ${id}`,
  artis: 'Kadek Wira',
  deskripsi: null,
  durasi: '04:05',
  genre: 'Pop',
  tahunRilis: 2025,
  audioFile: file(`/a/${id}.mp3`),
  coverImage: file(`/c/${id}.jpg`),
  isActive: true,
  ...over,
});
const raw = [
  musik('a'),
  musik('b', { genre: 'pop', artis: 'Sekaa Gong' }),
  musik('c', { audioFile: null, coverImage: null, genre: 'Jazz' }),
].map(toTrack);
// Sama seperti useMusikLibrary: genre tiap lagu disamakan dengan label turunannya.
const tracks = withGenreLabels(raw, deriveGenres(raw));
const lib = (over = {}) => ({
  tracks,
  artists: deriveArtists(tracks),
  genres: deriveGenres(tracks),
  isLoading: false,
  loadError: false,
  onRetry: noop,
  currentId: null as string | null,
  isPlaying: false,
  onPlay: noop,
  ...over,
});

describe('MusikHomeView', () => {
  it('h1 + lead, empat rak berurutan dengan "Lihat semua"', () => {
    const html = render(<MusikHomeView {...lib()} />);
    expect(count(html, '<h1')).toBe(1);
    expect(text(html)).toContain(`${T.homeTitle} ${T.homeLead}`);
    expect(h2s(html)).toEqual([T.shelfTerbaru, T.shelfSemua, T.shelfArtis, T.shelfGenre]);
    expect(count(html, `>${T.lihatSemua}</a>`)).toBe(4);
    expect(count(html, `aria-label="${T.geserKanan}"`)).toBe(3);
  });

  it('panah rak di ujung: aria-disabled (fokus tetap), bukan atribut disabled', () => {
    const html = render(<MusikHomeView {...lib()} />);
    expect(html).not.toMatch(/<button[^>]*\sdisabled/);
    expect(count(html, 'aria-disabled="true"')).toBe(6); // 3 rak gulir × ‹ ›, awal render = kedua ujung
  });

  it('ubin artis & genre menaut ke Jelajahi tersaring; "Pop" dan "pop" satu ubin', () => {
    const html = render(<MusikHomeView {...lib()} />);
    expect(html).toContain('href="/musik/musik-desa/jelajahi?artis=kadek+wira"');
    expect(html).toContain('href="/musik/musik-desa/jelajahi?genre=pop"');
    expect(count(html, '?genre=')).toBe(2);
    expect(text(html)).toContain('Kadek Wira 2 lagu');
  });

  it('"Terbaru" = urutan API (terbaru dulu), "Semua lagu" = judul A–Z', () => {
    const newest = [musik('z', { judul: 'Zapin' }), musik('m', { judul: 'Mekar' }), musik('a2', { judul: 'Angklung' })].map(toTrack);
    const html = render(<MusikHomeView {...lib({ tracks: newest })} />);
    const shelf = (title: string) => text(html.split(`>${title}</h2>`)[1]?.split('</ul>')[0] ?? '');
    expect(shelf(T.shelfTerbaru)).toMatch(/Zapin.*Mekar.*Angklung/);
    expect(shelf(T.shelfSemua)).toMatch(/Angklung.*Mekar.*Zapin/);
  });

  it('setiap rak beranda maks 12 item (Terbaru, Semua lagu, Artis, Genre)', () => {
    const many = Array.from({ length: 15 }, (_, i) => musik(`m${i}`, { artis: `Artis ${i}`, genre: `Genre ${i}` })).map(toTrack);
    const html = render(<MusikHomeView {...lib({ tracks: many, artists: deriveArtists(many), genres: deriveGenres(many) })} />);
    const items = (title: string) => count(html.split(`>${title}</h2>`)[1]?.split('</ul>')[0] ?? '', '<li');
    expect([TERBARU_LIMIT, SEMUA_LIMIT, ARTIS_LIMIT, GENRE_LIMIT]).toEqual([12, 12, 12, 12]);
    expect([T.shelfTerbaru, T.shelfSemua, T.shelfArtis, T.shelfGenre].map(items)).toEqual([12, 12, 12, 12]);
  });

  it('ubin artis bersampul tetap memuat inisial di bawah gambar (cadangan bila sampul gagal dimuat)', () => {
    const html = render(<MusikHomeView {...lib()} />);
    const tile = html.split('href="/musik/musik-desa/jelajahi?artis=kadek+wira"')[1]?.split('</a>')[0] ?? '';
    expect(tile).toMatch(/<span class="[^"]*">KW<\/span><img /);
  });

  it('rak tanpa isi tidak dirender (tanpa genre & artis)', () => {
    const plain = [musik('x', { genre: null, artis: '' })].map(toTrack);
    const html = render(<MusikHomeView {...lib({ tracks: plain, artists: [], genres: [] })} />);
    expect(h2s(html)).toEqual([T.shelfTerbaru, T.shelfSemua]);
  });

  it('baris yang diputar ber-accent (data-active) + equalizer bergerak; lainnya tidak', () => {
    const html = render(<MusikHomeView {...lib({ currentId: 'a', isPlaying: true })} />);
    expect(count(html, `class="${row.row}" data-active="true"`)).toBe(1);
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-playing="true"');
    // Nama tombol = kata kerja (sr-only) + isi yang terlihat; tanpa aria-label yang menelan isi.
    expect(text(html)).toContain(`${T.jeda} Lagu a Kadek Wira 4:05`);
    expect(text(html)).toContain(`${T.putar} Lagu b Sekaa Gong 4:05`);
    expect(html).not.toMatch(/<button[^>]*aria-label="(Putar|Jeda) /);
  });

  it('lagu tanpa audio redup + "Audio belum tersedia" menggantikan durasi', () => {
    const html = render(<MusikHomeView {...lib()} />);
    expect(count(html, 'data-playable="false"')).toBe(2); // kartu + baris lagu c
    // Hanya sampul dibungkus .cover (diredupkan CSS); teks tanpa gaya inline/opacity.
    expect(count(html, `<span class="${row.cover}">`)).toBe(3);
    expect(html).not.toContain('opacity');
    expect(text(html)).toContain(`${T.putar} Lagu c Kadek Wira ${T.audioBelum}`);
    expect(text(html)).toContain('4:05');
  });

  it('memuat → kerangka aria-busy tanpa rak; kosong → panel "Belum ada lagu"', () => {
    const loading = render(<MusikHomeView {...lib({ isLoading: true })} />);
    expect(loading).toContain('aria-busy="true"');
    expect(h2s(loading)).toEqual([]);
    const empty = render(<MusikHomeView {...lib({ tracks: [], artists: [], genres: [] })} />);
    expect(h2s(empty)).toEqual([T.kosongTitle]);
  });

  it('API gagal (loadError) → panel "Gagal memuat lagu" + "Coba lagi", bukan "Belum ada lagu"', () => {
    const html = render(<MusikHomeView {...lib({ tracks: [], artists: [], genres: [], loadError: true })} />);
    expect(h2s(html)).toEqual([T.gagalTitle]);
    expect(html).toMatch(new RegExp(`<button type="button"[^>]*>${T.cobaLagi}</button>`));
    expect(text(html)).not.toContain(T.kosongBody);
  });

  it('loadError tapi lagu sudah ada (muat ulang gagal) → rak tetap tampil', () => {
    const html = render(<MusikHomeView {...lib({ loadError: true })} />);
    expect(h2s(html)).toEqual([T.shelfTerbaru, T.shelfSemua, T.shelfArtis, T.shelfGenre]);
    expect(html).not.toContain(T.gagalTitle);
  });

  it('teks UI tanpa em dash', () => {
    expect(text(render(<MusikHomeView {...lib()} />))).not.toContain('—');
  });
});

describe('MusikJelajahiView', () => {
  const view = (q: string, over = {}) =>
    render(<MusikJelajahiView {...lib(over)} params={parseJelajahiParams(new URLSearchParams(q))} update={noop} />);

  it('pil genre: "Semua" ditekan bila tanpa filter; hasil semua lagu', () => {
    const html = view('');
    expect(html).toMatch(new RegExp(`aria-pressed="true"[^>]*>${T.semuaGenre}</button>`));
    expect(h2s(html)).toEqual([T.jumlahLagu(3)]);
    expect(html).not.toContain(T.hapusFilter);
  });

  it('?genre=POP&q=lagu → pil Pop ditekan, chip filter + "Hapus filter", 2 lagu', () => {
    const html = view('genre=POP&q=lagu');
    expect(html).toMatch(/aria-pressed="true"[^>]*>Pop<\/button>/);
    expect(h2s(html)).toEqual([T.jumlahLagu(2)]);
    expect(html).toContain(`aria-label="${T.hapusChip('Pop')}"`);
    expect(html).toContain(`aria-label="${T.hapusChip('&quot;lagu&quot;')}"`);
    expect(html).toContain(T.hapusFilter);
  });

  it('artis terpilih ditekan; kunci tak dikenal diabaikan', () => {
    expect(view('artis=sekaa%20gong')).toMatch(/aria-pressed="true"[^>]*><span[^>]*>.*?Sekaa Gong/);
    const unknown = view('genre=rock&artis=anonim');
    expect(h2s(unknown)).toEqual([T.jumlahLagu(3)]);
    expect(unknown).not.toContain(T.hapusFilter);
  });

  it('?genre=pop → kolom genre tabel memakai label "Pop" (bukan teks mentah "pop")', () => {
    const html = view('genre=pop');
    expect(text(html)).toContain('Lagu b Sekaa Gong Pop 2025 4:05');
    expect(html).not.toContain('>pop<');
  });

  it('?genre=jazz → baris artis hanya artis yang punya lagu jazz; artis terpilih tetap tampil', () => {
    const artistRow = (html: string) => text(html.match(/<ul[^>]*aria-label="Artis"[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? '');
    // Inisial (KW/SG) ikut di teks karena kini selalu dirender di bawah sampul (avatar aria-hidden).
    expect(artistRow(view('genre=jazz'))).toBe('KW Kadek Wira');
    expect(artistRow(view('genre=jazz&artis=sekaa%20gong'))).toBe('KW Kadek Wira SG Sekaa Gong');
  });

  it('API gagal → panel gagal muat tanpa filter & tabel', () => {
    const html = view('', { tracks: [], artists: [], genres: [], loadError: true });
    expect(h2s(html)).toEqual([T.gagalTitle]);
    expect(html).toContain(T.cobaLagi);
    expect(html).not.toContain(T.kosongTitle);
  });

  it('tidak cocok → "Tidak ada lagu yang cocok"', () => {
    expect(h2s(view('q=zzz'))).toEqual([T.jumlahLagu(0), T.hasilKosongTitle]);
  });

  it('tabel: nomor urut, genre, tahun; baris diputar diganti equalizer', () => {
    const html = view('', { currentId: 'b', isPlaying: false });
    expect(text(html)).toContain(`1 ${T.putar} Lagu a Kadek Wira Pop 2025 4:05`);
    expect(html).toContain('data-playing="false"');
    expect(text(html)).toContain(`${T.sedangDiputar} ${T.putar} Lagu b`);
    expect(text(html)).not.toContain(` 2 ${T.putar} Lagu b`);
  });
});

describe('TrackTable (Jelajahi): tabel semantik', () => {
  const html = render(
    <MusikJelajahiView {...lib({ currentId: 'a', isPlaying: true })} params={parseJelajahiParams(new URLSearchParams())} update={noop} />,
  );

  it('role table → row → columnheader/cell; header tidak aria-hidden; # punya nama "Nomor"', () => {
    expect(html).toContain(`role="table" aria-label="${T.tabelLabel}"`);
    expect(count(html, 'role="columnheader"')).toBe(5);
    expect(count(html, 'role="row"')).toBe(1 + tracks.length);
    expect(count(html, 'role="cell"')).toBe(5 * tracks.length);
    expect(html).not.toMatch(/role="row"[^>]*aria-hidden/);
    expect(text(html)).toContain(`${T.kolomNo} ${T.kolomNoLabel} ${T.kolomJudul}`);
  });

  it('tombol di sel judul: kata kerja + judul + artis, durasi/keterangan lewat aria-describedby', () => {
    const buttons = [...html.matchAll(/<button[^>]*aria-describedby="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
    expect(buttons.map((m) => text(m[2]))).toEqual([`${T.jeda} Lagu a Kadek Wira`, `${T.putar} Lagu b Sekaa Gong`, `${T.putar} Lagu c Kadek Wira`]);
    const described = (i: number) => text(html.match(new RegExp(`id="${buttons[i][1]}"[^>]*>([^<]*)<`))?.[1] ?? '');
    expect(described(0)).toBe('4:05');
    expect(described(2)).toBe(T.audioBelum);
  });
});

describe('MusikLoadError', () => {
  it('tombol "Coba lagi" memanggil onRetry', () => {
    const onRetry = vi.fn();
    // MusikLoadError → <MusikEmpty action={<button onClick>}>: klik disimulasikan lewat prop elemen.
    const panel = MusikLoadError({ onRetry }) as ReactElement<{ action: ReactElement<{ onClick: () => void }> }>;
    panel.props.action.props.onClick();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('MusikPlaylist', () => {
  it('h1, lead kurasi admin, panel kosong', () => {
    const html = render(<MusikPlaylist />);
    expect(text(html)).toBe(`${T.playlistTitle} ${T.playlistLead} ${T.playlistKosongTitle} ${T.playlistKosongBody}`);
    expect(html).toContain('<h1');
  });
});
