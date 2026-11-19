// @vitest-environment node
// Kontak Desa: aturan validasi bersama API dan form admin (src/lib/kontak-desa.ts): field wajib, batas panjang,
// telepon (nomor tetap/seluler Indonesia saja), format email, dan pembuangan kunci di luar empat field.
import { describe, expect, it } from 'vitest';
import {
  ALAMAT_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAMA_KANTOR_MAX_LENGTH,
  TELEPON_MAX_DIGITS,
  isTeleponKontakValid,
  parseKontakDesaInput,
} from '@/lib/kontak-desa';

// test-only: isian rekaan yang valid.
const VALID = { namaKantor: 'Kantor Uji', alamat: 'Jl. Uji No. 1', telepon: '(0361) 8441518', email: 'uji@example.com' };
const parse = (patch: Record<string, unknown>) => parseKontakDesaInput({ ...VALID, ...patch });

describe('isTeleponKontakValid', () => {
  it.each(['(0361) 8441518', '0361 8441518', '0361-8441518', '+62 361 8441518', '081234567890', '+6281234567890'])(
    'menerima %s',
    (telepon) => expect(isTeleponKontakValid(telepon)).toBe(true),
  );

  it.each([
    ['huruf', 'abc'],
    ['campur huruf', '0361 8441518 ext 2'],
    ['nomor layanan pendek', '112'],
    ['terlalu pendek', '12345'],
    ['simbol terlarang', '0361/8441518'],
    [`lebih dari ${TELEPON_MAX_DIGITS} digit`, '1'.repeat(TELEPON_MAX_DIGITS + 1)],
  ])('menolak %s', (_label, telepon) => expect(isTeleponKontakValid(telepon)).toBe(false));
});

describe('parseKontakDesaInput', () => {
  it('menerima isian valid dan merapikan spasi berulang di tepi/tengah', () => {
    const result = parse({ namaKantor: '  Kantor   Uji  ', alamat: ' Jl.  Uji ', email: ' uji@example.com ' });
    expect(result).toEqual({
      ok: true,
      data: { namaKantor: 'Kantor Uji', alamat: 'Jl. Uji', telepon: '(0361) 8441518', email: 'uji@example.com' },
    });
  });

  it('membuang kunci di luar empat field (id, isActive, dst. tidak ikut tersimpan)', () => {
    const result = parse({ id: 'lain', isActive: false });
    expect(result.ok && Object.keys(result.data).sort()).toEqual(['alamat', 'email', 'namaKantor', 'telepon']);
  });

  it.each([
    ['namaKantor', '', 'Nama kantor wajib diisi'],
    ['namaKantor', '   ', 'Nama kantor wajib diisi'],
    ['alamat', '', 'Alamat wajib diisi'],
    ['telepon', '', 'Telepon wajib diisi'],
    ['email', '', 'Email wajib diisi'],
  ])('menolak %s kosong (%j)', (key, value, message) => {
    expect(parse({ [key]: value })).toEqual({ ok: false, message });
  });

  it('menolak field yang tidak dikirim atau bukan teks', () => {
    expect(parseKontakDesaInput({ ...VALID, alamat: undefined })).toEqual({ ok: false, message: 'Alamat wajib diisi' });
    expect(parse({ telepon: 8441518 })).toEqual({ ok: false, message: 'Telepon harus berupa teks' });
    expect(parseKontakDesaInput(null).ok).toBe(false);
  });

  it('menolak telepon dan email yang formatnya salah dengan pesan yang menunjuk field-nya', () => {
    const telepon = parse({ telepon: 'abc' });
    expect(!telepon.ok && telepon.message).toMatch(/^Telepon tidak valid/);
    for (const email of ['tanpa-at', 'a@b', 'a b@c.id', '@c.id']) {
      const result = parse({ email });
      expect(result, email).toEqual({ ok: false, message: 'Format email tidak valid, mis. nama@desa.id' });
    }
  });

  it('menolak teks melebihi batas panjang tiap field', () => {
    expect(parse({ namaKantor: 'x'.repeat(NAMA_KANTOR_MAX_LENGTH + 1) })).toEqual({
      ok: false,
      message: `Nama kantor maksimal ${NAMA_KANTOR_MAX_LENGTH} karakter`,
    });
    expect(parse({ alamat: 'x'.repeat(ALAMAT_MAX_LENGTH + 1) })).toEqual({
      ok: false,
      message: `Alamat maksimal ${ALAMAT_MAX_LENGTH} karakter`,
    });
    const email = `${'x'.repeat(EMAIL_MAX_LENGTH)}@example.com`;
    expect(parse({ email })).toEqual({ ok: false, message: `Email maksimal ${EMAIL_MAX_LENGTH} karakter` });
    expect(parse({ namaKantor: 'x'.repeat(NAMA_KANTOR_MAX_LENGTH) }).ok).toBe(true);
  });
});
