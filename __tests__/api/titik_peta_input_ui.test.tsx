// @vitest-environment node
// Input titik peta admin: pilihan mode "Cari alamat" | "Lintang & bujur" + peta yang selalu tampil.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; pindah mode/klik tidak bisa diuji di sini
// (logika mode awal & jalan keluar cari gagal diuji di titik_peta_logic.test.ts).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// Peta Leaflet butuh window; dynamic() diganti penanda.
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

import TitikPetaInput from '@/app/admin/(dashboard)/_com/konten-bersama/titik-peta.input';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const modeTerpilih = (html: string) =>
  html.match(/<input[^>]*type="radio"[^>]*>/g)?.find((tag) => / checked=/.test(tag))?.match(/value="([^"]+)"/)?.[1];

describe('TitikPetaInput', () => {
  it('kontrol mode berlabel dengan dua pilihan dan teks pengantar baru', () => {
    const html = render(<TitikPetaInput koordinat={null} onKoordinatChange={() => {}} />);
    expect(html).toContain('aria-label="Cara menandai lokasi"');
    expect(text(html)).toContain('Cari alamat');
    expect(text(html)).toContain('Lintang & bujur');
    expect(text(html)).toContain('Cari dari alamat atau isi lintang & bujur, lalu rapikan dengan klik pada peta.');
  });

  it('tanpa titik → mode cari alamat: kolom cari tampil, kolom Lintang/Bujur tidak; peta tetap ada', () => {
    const html = render(<TitikPetaInput koordinat={null} onKoordinatChange={() => {}} alamat="Balai Desa Darmasaba" />);
    expect(modeTerpilih(html)).toBe('alamat');
    expect(html).toContain('aria-label="Cari alamat/tempat"');
    expect(html).toContain('value="Balai Desa Darmasaba"');
    expect(text(html)).toContain('Cari di peta');
    expect(html).not.toContain('placeholder="-8.571234"');
    expect(html).toContain('data-testid="peta"');
  });

  it('dengan titik tersimpan → mode lintang & bujur berisi nilai titik; kolom cari tidak tampil; baris lokasi & hapus tetap', () => {
    const html = render(
      <TitikPetaInput koordinat={{ lat: -8.571234, lng: 115.192345 }} onKoordinatChange={() => {}} onKoordinatHapus={() => {}} />,
    );
    expect(modeTerpilih(html)).toBe('koordinat');
    expect(html).toContain('value="-8.571234"');
    expect(html).toContain('value="115.192345"');
    expect(text(html)).toContain('Google Maps');
    expect(html).not.toContain('aria-label="Cari alamat/tempat"');
    expect(text(html)).not.toContain('Cari di peta');
    expect(html).toContain('data-testid="peta"');
    expect(text(html)).toContain('Lokasi dipilih: -8.571234, 115.192345');
    expect(text(html)).toContain('Hapus titik');
  });
});
