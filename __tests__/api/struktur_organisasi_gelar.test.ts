// @vitest-environment node
// Penggabungan gelar ke nama untuk seeder struktur — aturan harus sama dengan migrasi struktur_fleksibel.
import { describe, expect, it } from 'vitest';
import { gabungGelarKeNama } from '@/lib/struktur-organisasi';

describe('gabungGelarKeNama', () => {
  it('gelar ditambahkan di belakang nama dengan koma', () => {
    expect(gabungGelarKeNama('I Ketut Suwanta', 'S.Pt')).toBe('I Ketut Suwanta, S.Pt');
    expect(gabungGelarKeNama('  Ni Wayan  ', ' S.Pd ')).toBe('Ni Wayan, S.Pd');
  });

  it('gelar kosong/null → nama apa adanya', () => {
    expect(gabungGelarKeNama('I Made Ari', '')).toBe('I Made Ari');
    expect(gabungGelarKeNama('I Made Ari', '   ')).toBe('I Made Ari');
    expect(gabungGelarKeNama('I Made Ari', null)).toBe('I Made Ari');
  });

  it('nama yang sudah memuat gelarnya (beda spasi/huruf) tidak digandakan — seed ulang aman', () => {
    // test-only: contoh data seed PPID
    const nama = 'Ida Bagus Surya Prabhawa Manuaba, S.H.,M.H., NL.P.';
    expect(gabungGelarKeNama(nama, 'S.H.,M.H.,NL.P.')).toBe(nama);
    expect(gabungGelarKeNama('I Made Ari, s.kom', 'S.Kom')).toBe('I Made Ari, s.kom');
    const sekali = gabungGelarKeNama('I Ketut Suwanta', 'S.Pt');
    expect(gabungGelarKeNama(sekali, 'S.Pt')).toBe(sekali);
  });

  it('hasil dipotong ke 255 karakter (kolom VarChar(255))', () => {
    const hasil = gabungGelarKeNama('A'.repeat(254), 'S.Kom');
    expect(Array.from(hasil)).toHaveLength(255);
    expect(hasil.startsWith('A'.repeat(254))).toBe(true);
  });
});
