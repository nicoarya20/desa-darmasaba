// @vitest-environment node
// Bimbingan Belajar Desa: pengurai info praktis (Lokasi dan Jadwal) dan pemisahannya dari bagian berlabel.
import { describe, expect, it } from 'vitest';
import {
  iconForLabel,
  splitInfoPraktis,
  toLabeledItems,
} from '@/app/(public)/(pages)/pendidikan/bimbingan-belajar-desa/_com/bimbingan.logic';
import type { ProgramInfoEntry } from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.logic';

// test-only: isi stg 2026-11-15.
const LOKASI =
  '<ul><li><p>Lokasi: Balai Banjar / Balai Desa Darmasaba / Perpustakaan Desa</p></li><li><p>Jadwal: Setiap hari Senin, Rabu, dan Jumat pukul 16.00–18.00 WITA</p></li><li><p>Peserta: Terbuka untuk semua siswa SD–SMP di wilayah desa</p></li></ul>';
const TUJUAN = '<ul><li><p>Memberikan pendampingan belajar secara gratis</p></li></ul>';
const FASILITAS = '<ul><li><p>Buku-buku pelajaran dan alat tulis</p></li></ul>';

// test-only
const entry = (key: string, title: string, html: string | null, failed = false): ProgramInfoEntry => ({ key, title, html, failed });
const entries = (lokasi: ProgramInfoEntry = entry('lokasi', 'Lokasi dan Jadwal', LOKASI)) => [
  entry('tujuan', 'Tujuan Program', TUJUAN),
  lokasi,
  entry('fasilitas', 'Fasilitas yang Disediakan', FASILITAS),
];

describe('toLabeledItems', () => {
  it('memecah tiap butir "Label: nilai" dan memberi jenis ikon dari labelnya', () => {
    expect(toLabeledItems(LOKASI)).toEqual([
      { label: 'Lokasi', value: 'Balai Banjar / Balai Desa Darmasaba / Perpustakaan Desa', kind: 'lokasi' },
      { label: 'Jadwal', value: 'Setiap hari Senin, Rabu, dan Jumat pukul 16.00–18.00 WITA', kind: 'jadwal' },
      { label: 'Peserta', value: 'Terbuka untuk semua siswa SD–SMP di wilayah desa', kind: 'peserta' },
    ]);
  });

  it('titik dua di dalam nilai (jam 16:00) tetap bagian dari nilai', () => {
    expect(toLabeledItems('<ul><li><p>Jam: 16:00 - 18:00</p></li></ul>')).toEqual([
      { label: 'Jam', value: '16:00 - 18:00', kind: 'jadwal' },
    ]);
  });

  it('satu butir saja tanpa label → null (Lokasi tetap bagian biasa, tak ada teks yang hilang)', () => {
    expect(toLabeledItems('<ul><li><p>Lokasi: Balai Desa</p></li><li><p>Dibuka untuk umum</p></li></ul>')).toBeNull();
    expect(toLabeledItems('<ul><li><p>Lokasi:</p></li></ul>')).toBeNull();
    expect(toLabeledItems('<ul><li><p>Catatan: siswa, orang tua, dan guru: hadir</p></li></ul>')).not.toBeNull();
    expect(toLabeledItems('<ul><li><p>Siswa, orang tua, dan guru: hadir bersama</p></li></ul>')).toBeNull();
  });

  it('bukan satu daftar teks polos (paragraf, tautan) atau kosong → null', () => {
    expect(toLabeledItems('<p>Lokasi: Balai Desa</p>')).toBeNull();
    expect(toLabeledItems('<ul><li><a href="x">Lokasi: Balai</a></li></ul>')).toBeNull();
    expect(toLabeledItems('<p></p>')).toBeNull();
    expect(toLabeledItems(null)).toBeNull();
  });
});

describe('iconForLabel', () => {
  it('mengenali kata kunci tanpa peduli huruf besar; label lain tanpa ikon', () => {
    expect(iconForLabel('Tempat Kegiatan')).toBe('lokasi');
    expect(iconForLabel('ALAMAT')).toBe('lokasi');
    expect(iconForLabel('Waktu')).toBe('jadwal');
    expect(iconForLabel('Hari & Jam')).toBe('jadwal');
    expect(iconForLabel('Sasaran')).toBe('peserta');
    expect(iconForLabel('Biaya')).toBeNull();
    expect(iconForLabel('Penjadwalan ulang')).toBeNull();
  });
});

describe('splitInfoPraktis', () => {
  it('Lokasi berlabel → panel info; Lokasi tidak diulang, urutan Tujuan lalu Fasilitas', () => {
    const { info, sections } = splitInfoPraktis(entries());
    expect(info?.judul).toBe('Lokasi dan Jadwal');
    expect(info?.items).toHaveLength(3);
    expect(sections.map((x) => x.key)).toEqual(['tujuan', 'fasilitas']);
  });

  it('Lokasi tidak berlabel, kosong, atau gagal → tanpa panel, Lokasi tetap bagian di urutan semula', () => {
    for (const lokasi of [
      entry('lokasi', 'Lokasi dan Jadwal', '<p>Di Balai Desa setiap sore.</p>'),
      entry('lokasi', 'Lokasi dan Jadwal', null),
      entry('lokasi', 'Lokasi dan Jadwal', null, true),
    ]) {
      const { info, sections } = splitInfoPraktis(entries(lokasi));
      expect(info).toBeNull();
      expect(sections.map((x) => x.key)).toEqual(['tujuan', 'lokasi', 'fasilitas']);
    }
  });
});
