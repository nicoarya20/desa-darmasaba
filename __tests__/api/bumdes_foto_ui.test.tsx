// @vitest-environment node
// Galeri foto Profil BUMDes: grid publik (keterangan, jumlah, kosong) dan grid admin.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GaleriFotoBumdes from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/GaleriFotoBumdes';
import GaleriFotoAdminGrid from '@/app/admin/(dashboard)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_lib/GaleriFotoAdminGrid';
import type { FotoProfilBumdesData } from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: foto galeri siap tampil.
const foto = (id: string, keterangan: string | null): FotoProfilBumdesData => ({
  id,
  imageId: `img-${id}`,
  keterangan,
  urutan: 0,
  image: { id: `img-${id}`, name: `${id}.webp`, link: `/api/img/${id}.webp` },
});

const noop = () => undefined;

describe('GaleriFotoBumdes (publik)', () => {
  it('satu tombol per foto, keterangan tampil, foto tanpa keterangan memakai alt nama BUMDes', () => {
    const html = render(
      <GaleriFotoBumdes foto={[foto('a', 'Panen jeruk'), foto('b', null), foto('c', 'Kios')]} namaBumdes="BUMDes Sari" />,
    );
    expect(count(html, 'data-testid="galeri-foto-item"')).toBe(3);
    expect(html).toContain('Galeri Foto');
    expect(html).toContain('Panen jeruk');
    expect(html).toContain('alt="Foto BUMDes Sari 2"');
    expect(html).toContain('src="/api/img/c.webp"');
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it('galeri kosong → tidak merender apa pun', () => {
    const html = render(<GaleriFotoBumdes foto={[]} namaBumdes="BUMDes Sari" />);
    expect(html).not.toContain('galeri-foto-bumdes');
    expect(html).not.toContain('Galeri Foto');
  });
});

describe('GaleriFotoAdminGrid (admin)', () => {
  const props = { savingId: null, moveLocked: false, onSaveKeterangan: noop, onMove: noop, onDelete: noop };

  it('render kartu per foto dengan input keterangan terisi', () => {
    const html = render(<GaleriFotoAdminGrid foto={[foto('a', 'Kantor'), foto('b', null)]} {...props} />);
    expect(count(html, 'data-testid="galeri-foto-admin-card"')).toBe(2);
    expect(html).toContain('value="Kantor"');
    expect(html).toContain('aria-label="Keterangan foto 2"');
    expect(html).toContain('aria-label="Hapus foto 1"');
  });

  it('tombol geser di ujung daftar dinonaktifkan', () => {
    const html = render(<GaleriFotoAdminGrid foto={[foto('a', null), foto('b', null)]} {...props} />);
    expect(html).toMatch(/aria-label="Geser foto 1 ke depan"[^>]*disabled/);
    expect(html).toMatch(/aria-label="Geser foto 2 ke belakang"[^>]*disabled/);
    expect(html).not.toMatch(/aria-label="Geser foto 1 ke belakang"[^>]*disabled/);
  });

  it('galeri kosong → pesan belum ada foto', () => {
    const html = render(<GaleriFotoAdminGrid foto={[]} {...props} />);
    expect(html).toContain('Belum ada foto di galeri.');
  });
});
