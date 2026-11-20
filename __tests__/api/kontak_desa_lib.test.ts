// @vitest-environment node
// Kontak Desa: aturan validasi bersama API dan form admin (src/lib/kontak-desa.ts): field wajib, batas panjang,
// telepon (nomor tetap/seluler Indonesia saja), format email, WhatsApp opsional (seluler saja), dan pembuangan kunci
// di luar kelima field.
import { describe, expect, it } from 'vitest';
import {
  ALAMAT_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAMA_KANTOR_MAX_LENGTH,
  TELEPON_MAX_DIGITS,
  WHATSAPP_MAX_LENGTH,
  isTeleponKontakValid,
  isWhatsappKontakValid,
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
      data: { namaKantor: 'Kantor Uji', alamat: 'Jl. Uji', telepon: '(0361) 8441518', email: 'uji@example.com', whatsapp: null },
    });
  });

  it('membuang kunci di luar kelima field (id, isActive, dst. tidak ikut tersimpan)', () => {
    const result = parse({ id: 'lain', isActive: false });
    expect(result.ok && Object.keys(result.data).sort()).toEqual(['alamat', 'email', 'namaKantor', 'telepon', 'whatsapp']);
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

describe('isWhatsappKontakValid', () => {
  it.each(['081234567890', '0812 3958 0000', '0812-3958-0000', '+62 812 3958 0000', '6281239580000'])(
    'menerima seluler %s',
    (wa) => expect(isWhatsappKontakValid(wa)).toBe(true),
  );

  it.each([
    ['telepon tetap (tidak bisa WhatsApp)', '(0361) 8441518'],
    ['nomor layanan pendek', '112'],
    ['huruf', 'abc'],
    ['simbol terlarang', '0812/3958/0000'],
    [`lebih dari ${TELEPON_MAX_DIGITS} digit`, '08' + '1'.repeat(TELEPON_MAX_DIGITS)],
  ])('menolak %s', (_label, wa) => expect(isWhatsappKontakValid(wa)).toBe(false));
});

describe('parseKontakDesaInput: WhatsApp opsional', () => {
  it.each([
    ['tidak dikirim', undefined],
    ['null', null],
    ['string kosong', ''],
    ['hanya spasi', '   '],
  ])('%s → null (desa belum punya nomor; bukan galat)', (_label, whatsapp) => {
    const input = whatsapp === undefined ? { ...VALID } : { ...VALID, whatsapp };
    const result = parseKontakDesaInput(input);
    expect(result.ok && result.data.whatsapp).toBeNull();
  });

  it('nomor seluler valid disimpan apa adanya setelah spasi dirapikan', () => {
    const result = parse({ whatsapp: ' 0812   3958 0000 ' });
    expect(result.ok && result.data.whatsapp).toBe('0812 3958 0000');
  });

  it('menolak telepon tetap dan teks bukan nomor dengan pesan yang menunjuk WhatsApp', () => {
    for (const whatsapp of ['(0361) 8441518', 'abc', '112']) {
      const result = parse({ whatsapp });
      expect(!result.ok && result.message, whatsapp).toMatch(/^WhatsApp tidak valid/);
    }
  });

  it('menolak nilai bukan teks dan teks melebihi batas panjang', () => {
    expect(parse({ whatsapp: 81239580000 })).toEqual({ ok: false, message: 'WhatsApp harus berupa teks' });
    expect(parse({ whatsapp: '0'.repeat(WHATSAPP_MAX_LENGTH + 1) })).toEqual({
      ok: false,
      message: `WhatsApp maksimal ${WHATSAPP_MAX_LENGTH} karakter`,
    });
  });

  it('WhatsApp kosong tidak menggagalkan field wajib lain (tetap ditolak bila field lain salah)', () => {
    expect(parse({ whatsapp: '', email: 'salah' }).ok).toBe(false);
  });
});
