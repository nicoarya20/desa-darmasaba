// @vitest-environment node
// Galeri foto bersama (PUSTU, Posyandu, Lembaga info-sekolah, Bank Sampah): modal pratinjau dengan strip thumbnail.
// jsdom gagal start di repo ini, jadi markup diuji via renderToStaticMarkup; klik/←/→/Escape diverifikasi manual (QA).
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, Modal } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid';
import GaleriFotoLightbox from '@/app/(public)/_com/konten-bersama/galeri-foto.lightbox';
import { altFoto, langkahFoto } from '@/app/(public)/_com/konten-bersama/galeri-foto.logic';
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types';

// test-only: n foto fiktif; foto ke-2 tanpa keterangan.
const buatFoto = (n: number): FotoGaleriItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `f${i + 1}`,
    imageId: `i${i + 1}`,
    keterangan: i === 1 ? null : `Kegiatan ${i + 1}`,
    urutan: i + 1,
    image: { id: `i${i + 1}`, link: `/foto-${i + 1}.jpg` },
  }));

// Modal di portal tidak dirender di server; matikan portal agar isi modal bisa diperiksa.
// `<Modal>` (bukan Modal.Root) membawa defaultProps sendiri (withinPortal: true) → extend Modal, bukan ModalRoot.
const theme = { components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, s: string) => html.split(s).length - 1;
const lightbox = (foto: FotoGaleriItem[], index: number | null) =>
  render(<GaleriFotoLightbox foto={foto} index={index} onIndexChange={() => {}} namaPemilik="PUSTU Banjar Bersih" />);

describe('langkahFoto & altFoto', () => {
  it('←/→ berhenti di ujung (tanpa wrap)', () => {
    expect(langkahFoto(0, -1, 5)).toBe(0);
    expect(langkahFoto(0, 1, 5)).toBe(1);
    expect(langkahFoto(3, -1, 5)).toBe(2);
    expect(langkahFoto(4, 1, 5)).toBe(4);
    expect(langkahFoto(0, 1, 1)).toBe(0);
  });

  it('alt = keterangan, atau "Foto {pemilik} {n}" bila kosong', () => {
    const [a, b] = buatFoto(2);
    expect(altFoto(a, 0, 'Posyandu')).toBe('Kegiatan 1');
    expect(altFoto(b, 1, 'Posyandu')).toBe('Foto Posyandu 2');
  });
});

describe('GaleriFotoLightbox: strip thumbnail', () => {
  it('jumlah thumbnail = jumlah foto, label "Lihat foto N dari M"', () => {
    const html = lightbox(buatFoto(7), 2);
    expect(count(html, 'data-testid="galeri-foto-thumb"')).toBe(7);
    expect(html).toContain('aria-label="Lihat foto 1 dari 7"');
    expect(html).toContain('aria-label="Lihat foto 7 dari 7"');
  });

  it('aria-current hanya di thumbnail index aktif', () => {
    const html = lightbox(buatFoto(5), 3);
    expect(count(html, 'aria-current="true"')).toBe(1);
    expect(html).toMatch(/aria-current="true" aria-label="Lihat foto 4 dari 5"/);
  });

  it('judul, foto besar, dan keterangan mengikuti foto aktif', () => {
    const html = lightbox(buatFoto(4), 2);
    const fotoBesar = html.match(/<img[^>]*alt="Kegiatan 3"[^>]*>/)?.[0] ?? '';
    expect(fotoBesar).toContain('src="/foto-3.jpg"');
    expect(count(html, 'Kegiatan 3')).toBeGreaterThanOrEqual(3); // judul + alt + keterangan
    // Foto tanpa keterangan: judul = nama pemilik, alt bernomor.
    const tanpa = lightbox(buatFoto(4), 1);
    expect(tanpa).toContain('alt="Foto PUSTU Banjar Bersih 2"');
    expect(tanpa).toContain('PUSTU Banjar Bersih');
  });

  it('tombol sebelumnya nonaktif di foto pertama, berikutnya nonaktif di foto terakhir', () => {
    const awal = lightbox(buatFoto(3), 0);
    expect(awal).toMatch(/aria-label="Foto sebelumnya" aria-disabled="true"/);
    expect(awal).not.toMatch(/aria-label="Foto berikutnya" aria-disabled="true"/);
    const akhir = lightbox(buatFoto(3), 2);
    expect(akhir).toMatch(/aria-label="Foto berikutnya" aria-disabled="true"/);
  });

  it('1 foto: tanpa strip dan tanpa tombol navigasi', () => {
    const html = lightbox(buatFoto(1), 0);
    expect(html).toContain('data-testid="galeri-foto-stage"');
    expect(html).not.toContain('data-testid="galeri-foto-strip"');
    expect(html).not.toContain('data-testid="galeri-foto-thumb"');
    expect(html).not.toContain('Foto sebelumnya');
  });

  it('index null / di luar daftar: modal tertutup', () => {
    expect(lightbox(buatFoto(3), null)).not.toContain('data-testid="galeri-foto-stage"');
    expect(lightbox(buatFoto(3), 9)).not.toContain('data-testid="galeri-foto-stage"');
  });
});

describe('GaleriFoto: kontrak props tetap', () => {
  it('grid tanpa modal terbuka; kosong → tidak dirender', () => {
    const html = render(<GaleriFoto foto={buatFoto(3)} namaPemilik="Posyandu" ariaLabel="Galeri foto Posyandu" testId="galeri-pustu" />);
    expect(html).toContain('data-testid="galeri-pustu"');
    expect(count(html, 'data-testid="galeri-foto-item"')).toBe(3);
    expect(html).toContain('aria-label="Lihat Foto Posyandu 2"');
    expect(html).not.toContain('data-testid="galeri-foto-stage"');
    expect(render(<GaleriFoto foto={[]} namaPemilik="X" ariaLabel="Galeri X" />)).not.toContain('Galeri X');
  });
});
