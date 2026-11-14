// @vitest-environment node
// Bagian Ulasan detail produk UMKM (isi kosong) + hitungan sebaran bintang.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UlasanSection } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/UlasanSection';
import {
  formatRataRata,
  persenBintang,
  totalDistribusi,
  ULASAN_KOSONG,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ulasan.logic';
import { ULASAN_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ulasan.text';
import s from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ulasan.module.css';

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('ulasan.logic', () => {
  it('persen bar: total 0 → 0, tanpa NaN', () => {
    expect(persenBintang(0, 0)).toBe(0);
    expect(persenBintang(3, 0)).toBe(0);
    expect(persenBintang(Number.NaN, 10)).toBe(0);
    expect(persenBintang(3, Number.NaN)).toBe(0);
  });

  it('persen bar: porsi dari total, maks 100', () => {
    expect(persenBintang(1, 4)).toBe(25);
    expect(persenBintang(4, 4)).toBe(100);
    expect(persenBintang(9, 4)).toBe(100);
  });

  it('total sebaran menjumlah 5 baris, angka negatif diabaikan', () => {
    expect(totalDistribusi(ULASAN_KOSONG.distribusi)).toBe(0);
    expect(totalDistribusi({ 1: 1, 2: 0, 3: 2, 4: -5, 5: 3 })).toBe(6);
  });

  it('rata-rata: null → "–", angka → satu desimal koma', () => {
    expect(formatRataRata(null)).toBe('–');
    expect(formatRataRata(4.46)).toBe('4,5');
    expect(formatRataRata(5)).toBe('5,0');
  });
});

describe('UlasanSection (kosong)', () => {
  const html = renderToStaticMarkup(<UlasanSection />);

  it('root section id="ulasan" dengan judul h2 "Ulasan"', () => {
    expect(html).toMatch(/^<section id="ulasan"/);
    expect(html).toMatch(/<h2 [^>]*>Ulasan<\/h2>/);
  });

  it('nilai "–" berlabel "Belum ada nilai", "(0 Ulasan)" dan teks kosong', () => {
    expect(html).toContain(`aria-label="${T.nilaiKosong}">–</span>`);
    expect(text(html)).toContain('(0 Ulasan)');
    expect(text(html)).toContain('Belum ada ulasan untuk produk ini.');
  });

  it('tombol "Tulis ulasan" disabled dan dijelaskan catatan', () => {
    const button = html.match(/<button[^>]*>Tulis ulasan<\/button>/)?.[0] ?? '';
    expect(button).toContain('disabled=""');
    const describedBy = button.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toContain(`id="${describedBy}" class="${s.note}">Penulisan ulasan belum dibuka.</p>`);
  });

  it('5 baris sebaran 5→1, semua bar 0%', () => {
    expect(count(html, `class="${s.row}"`)).toBe(5);
    expect(count(html, 'style="width:0%"')).toBe(5);
    const labels = [...html.matchAll(new RegExp(`class="${s.rowLabel}">(\\d)`, 'g'))].map((m) => m[1]);
    expect(labels).toEqual(['5', '4', '3', '2', '1']);
    expect(html).not.toContain('NaN');
  });

  it('ringkasan berisi → angka & lebar bar mengikuti sebaran', () => {
    const isi = renderToStaticMarkup(
      <UlasanSection ringkasan={{ rataRata: 4.5, jumlah: 4, distribusi: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 2 } }} />,
    );
    expect(isi).toContain('aria-label="Nilai 4,5 dari 5">4,5</span>');
    expect(text(isi)).toContain('(4 Ulasan)');
    expect(text(isi)).not.toContain(T.kosong);
    expect(count(isi, 'style="width:50%"')).toBe(2);
  });
});
