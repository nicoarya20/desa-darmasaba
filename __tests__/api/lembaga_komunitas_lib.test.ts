// @vitest-environment node
// Aturan Lembaga & Komunitas (src/lib/lembaga-komunitas.ts): validasi input, bentuk kontak, dan normalisasi teks tanpa DB.
import { describe, expect, it } from 'vitest';
import {
  DESKRIPSI_LEMBAGA_MAX,
  JENIS_LEMBAGA_MAX,
  NAMA_LEMBAGA_MAX,
  PESAN_LEMBAGA_KOMUNITAS as PESAN,
  URUTAN_LEMBAGA_MAX,
  jenisKontak,
  parseLembagaKomunitasInput,
} from '@/lib/lembaga-komunitas';

const VALID = { nama: 'Sekaa Teruna Banjar Contoh', jenis: 'STT' }; // test-only: data rekaan, bukan lembaga nyata

const fields = (result: ReturnType<typeof parseLembagaKomunitasInput>) => {
  if (!result.ok) throw new Error(`input ditolak: ${result.message}`);
  return result.data;
};

describe('parseLembagaKomunitasInput: input sah', () => {
  it('hanya nama + jenis → opsional jadi null, urutan 0, foto tidak diubah', () => {
    expect(fields(parseLembagaKomunitasInput(VALID))).toEqual({
      fields: { nama: VALID.nama, jenis: 'STT', deskripsi: null, ketua: null, kontak: null, urutan: 0 },
      fotoId: undefined,
    });
  });

  it('semua kolom terisi disimpan; spasi berlebih di satu baris dirapikan', () => {
    const data = fields(
      parseLembagaKomunitasInput({
        nama: '  PKK   Desa  ',
        jenis: ' PKK ',
        ketua: ' Ni  Contoh ',
        kontak: ' 0361-123 456 ',
        deskripsi: 'Satu.',
        urutan: 3,
        fotoId: 'foto-1',
      }),
    );
    expect(data.fields).toEqual({ nama: 'PKK Desa', jenis: 'PKK', ketua: 'Ni Contoh', kontak: '0361-123 456', deskripsi: 'Satu.', urutan: 3 });
    expect(data.fotoId).toBe('foto-1');
  });

  it('deskripsi multi baris: paragraf dipertahankan, baris kosong berlebih dan spasi ujung dirapikan', () => {
    const data = fields(parseLembagaKomunitasInput({ ...VALID, deskripsi: '  Baris satu.  \r\n\r\n\r\n\r\nBaris   dua.\n' }));
    expect(data.fields.deskripsi).toBe('Baris satu.\n\nBaris dua.');
  });

  it('isian opsional hanya spasi/kosong → null', () => {
    const data = fields(parseLembagaKomunitasInput({ ...VALID, ketua: '   ', kontak: '', deskripsi: null }));
    expect(data.fields).toMatchObject({ ketua: null, kontak: null, deskripsi: null });
  });

  it('fotoId: null atau string kosong = lepas foto; tidak dikirim = tidak diubah', () => {
    expect(fields(parseLembagaKomunitasInput({ ...VALID, fotoId: null })).fotoId).toBeNull();
    expect(fields(parseLembagaKomunitasInput({ ...VALID, fotoId: '' })).fotoId).toBeNull();
    expect(fields(parseLembagaKomunitasInput(VALID)).fotoId).toBeUndefined();
  });

  it('jenis teks bebas: jenis yang belum pernah ada diterima apa adanya', () => {
    expect(fields(parseLembagaKomunitasInput({ ...VALID, jenis: 'Subak Abian Contoh' })).fields.jenis).toBe('Subak Abian Contoh');
  });
});

describe('parseLembagaKomunitasInput: input ditolak', () => {
  it.each([
    ['nama kosong', { ...VALID, nama: '' }, PESAN.wajib('Nama')],
    ['nama hanya spasi', { ...VALID, nama: '   ' }, PESAN.wajib('Nama')],
    ['nama tidak ada', { jenis: 'PKK' }, PESAN.wajib('Nama')],
    ['jenis kosong', { ...VALID, jenis: '' }, PESAN.wajib('Jenis')],
    ['jenis bukan teks', { ...VALID, jenis: 7 }, PESAN.tipe('Jenis')],
    ['nama terlalu panjang', { ...VALID, nama: 'a'.repeat(NAMA_LEMBAGA_MAX + 1) }, PESAN.panjang('Nama', NAMA_LEMBAGA_MAX)],
    ['jenis terlalu panjang', { ...VALID, jenis: 'a'.repeat(JENIS_LEMBAGA_MAX + 1) }, PESAN.panjang('Jenis', JENIS_LEMBAGA_MAX)],
    ['deskripsi terlalu panjang', { ...VALID, deskripsi: 'a'.repeat(DESKRIPSI_LEMBAGA_MAX + 1) }, PESAN.panjang('Deskripsi', DESKRIPSI_LEMBAGA_MAX)],
    ['nama berisi tag', { ...VALID, nama: '<b>PKK</b>' }, PESAN.bukanTeksPolos('Nama')],
    ['deskripsi berisi tag script', { ...VALID, deskripsi: 'ok <script>x</script>' }, PESAN.bukanTeksPolos('Deskripsi')],
    ['kontak bukan telepon/email', { ...VALID, kontak: 'hubungi balai banjar' }, PESAN.kontakTidakValid],
    ['kontak telepon kependekan', { ...VALID, kontak: '12345' }, PESAN.kontakTidakValid],
    ['kontak berisi tag', { ...VALID, kontak: '<a>0361123456</a>' }, PESAN.bukanTeksPolos('Kontak')],
    ['urutan negatif', { ...VALID, urutan: -1 }, PESAN.urutanTidakValid],
    ['urutan pecahan', { ...VALID, urutan: 1.5 }, PESAN.urutanTidakValid],
    ['urutan melewati batas', { ...VALID, urutan: URUTAN_LEMBAGA_MAX + 1 }, PESAN.urutanTidakValid],
    ['urutan teks', { ...VALID, urutan: '2' }, PESAN.urutanTidakValid],
    ['fotoId bukan teks', { ...VALID, fotoId: 12 }, PESAN.fotoIdTipe],
  ])('%s', (_nama, input, message) => {
    expect(parseLembagaKomunitasInput(input)).toEqual({ ok: false, message });
  });
});

describe('jenisKontak', () => {
  it.each([
    ['0361-123456', 'telepon'],
    ['+62 361 123 456', 'telepon'],
    ['(0361) 123.456', 'telepon'],
    ['pkk@darmasaba.example', 'email'],
    ['ketua.stt@contoh.id', 'email'],
  ])('%s → %s', (kontak, jenis) => {
    expect(jenisKontak(kontak)).toBe(jenis);
  });

  it.each(['', 'abc', '12345', '1'.repeat(16), '0361-abc', 'tanpa@titik', '@contoh.id'])('"%s" → bukan kontak sah', (kontak) => {
    expect(jenisKontak(kontak)).toBeNull();
  });
});
