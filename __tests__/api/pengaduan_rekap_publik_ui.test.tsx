// @vitest-environment node
// Rekap Tindak Lanjut Pengaduan di hub Layanan Online Desa (Juknis lomba 3.3): kartu angka per status, daftar
// tanggapan terbaru, keadaan kosong/memuat, dan tidak ada data pelapor. jsdom rusak di repo ini → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { PengaduanRekapSection } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/rekap/PengaduanRekapSection';
import { PengaduanRekapView } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/rekap/PengaduanRekapView';
import { formatTanggalTanggapan, statusCards } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/rekap/rekap.logic';
import { PENGADUAN_REKAP_TEXT as T } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/rekap/rekap.text';
import type { PengaduanRekap } from '@/lib/pengaduan-rekap';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk `data` endpoint rekap.
const REKAP: PengaduanRekap = {
  total: 9,
  perStatus: { BARU: 4, DIPROSES: 2, SELESAI: 3, DITOLAK: 0 },
  perJenis: [{ jenis: 'Infrastruktur', jumlah: 6 }, { jenis: 'Kebersihan', jumlah: 3 }],
  tanggapanTerbaru: [
    { jenis: 'Infrastruktur', status: 'SELESAI', tanggapan: 'Jalan sudah ditambal.', tanggapanAt: '2026-11-17T08:00:00.000Z' },
    { jenis: 'Kebersihan', status: 'DIPROSES', tanggapan: 'Petugas dijadwalkan <b>Senin</b>.', tanggapanAt: null },
  ],
};
const KOSONG: PengaduanRekap = {
  total: 0,
  perStatus: { BARU: 0, DIPROSES: 0, SELESAI: 0, DITOLAK: 0 },
  perJenis: [],
  tanggapanTerbaru: [],
};

describe('PengaduanRekapView', () => {
  it('ada data: empat kartu angka berurutan, total, dan tanggapan terbaru dengan jenis, status, tanggal', () => {
    const html = render(<PengaduanRekapView rekap={REKAP} />);
    const cards = [...html.matchAll(/<span class="[^"]*">(\d+)<\/span><span class="[^"]*">([^<]+)<\/span>/g)].map((m) => [m[2], m[1]]);
    expect(cards).toEqual([['Baru', '4'], ['Diproses', '2'], ['Selesai', '3'], ['Ditolak', '0']]);
    expect(html).toContain(T.total(9));
    expect(html).toContain(T.listTitle);
    expect(html).toContain('Jalan sudah ditambal.');
    expect(html).toContain('Infrastruktur');
    expect(html).toContain('17 November 2026');
    expect(html).toContain('<time dateTime="2026-11-17T08:00:00.000Z">');
  });

  it('tanggapan dirender sebagai teks (HTML di-escape) dan tanggapan tanpa tanggal tidak punya <time>', () => {
    const html = render(<PengaduanRekapView rekap={REKAP} />);
    expect(html).toContain('Petugas dijadwalkan &lt;b&gt;Senin&lt;/b&gt;.');
    expect(html).not.toContain('<b>Senin</b>');
    expect(html.match(/<time /g)).toHaveLength(1);
  });

  it('tidak memuat data pribadi apa pun (hanya field rekap yang dirender)', () => {
    const html = render(<PengaduanRekapView rekap={REKAP} />);
    for (const pii of ['nik', 'email', 'nomorTelepon', 'judulPengaduan', 'lokasiKejadian', 'deskripsiPengaduan']) {
      expect(html.toLowerCase()).not.toContain(pii.toLowerCase());
    }
  });

  it('belum ada pengaduan: kalimat kosong yang sopan, tanpa kartu "0" dan tanpa peringatan galat', () => {
    const html = render(<PengaduanRekapView rekap={KOSONG} />);
    expect(html).toContain(T.empty);
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain(T.listTitle);
    expect(html).not.toContain('Diproses');
  });

  it('ada pengaduan tetapi belum ada tanggapan: kartu tampil, daftar diganti kalimat kosong', () => {
    const html = render(<PengaduanRekapView rekap={{ ...REKAP, tanggapanTerbaru: [] }} />);
    expect(html).toContain('Diproses');
    expect(html).toContain(T.noTanggapan);
    expect(html).not.toContain(T.listTitle);
  });
});

describe('PengaduanRekapSection', () => {
  it('render awal = kerangka memuat (aria-busy) dengan judul h2, bukan galat atau kosong', () => {
    const html = render(<PengaduanRekapSection />);
    expect(html).toMatch(/<h2[^>]*>Rekap Tindak Lanjut Pengaduan<\/h2>/);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(T.loading);
    expect(html).not.toContain(T.error);
    expect(html).not.toContain(T.empty);
  });
});

describe('rekap.logic', () => {
  it('statusCards selalu empat status sesuai urutan alur', () => {
    expect(statusCards(REKAP).map((c) => c.status)).toEqual(['BARU', 'DIPROSES', 'SELESAI', 'DITOLAK']);
    expect(statusCards(KOSONG).every((c) => c.jumlah === 0)).toBe(true);
  });

  it('formatTanggalTanggapan memakai WITA; null atau tidak valid → string kosong', () => {
    expect(formatTanggalTanggapan('2026-11-17T16:30:00.000Z')).toBe('18 November 2026'); // 00:30 WITA esok hari
    expect(formatTanggalTanggapan(null)).toBe('');
    expect(formatTanggalTanggapan('bukan-tanggal')).toBe('');
  });
});
