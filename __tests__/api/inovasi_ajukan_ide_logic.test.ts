// @vitest-environment node
// Ajukan Ide Inovatif publik: validasi isian, escape HTML untuk kolom yang dirender admin sebagai HTML, pengirim API.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { inovasi: { ajukanideinovatif: { create: { post } } } } },
}));

const { EMPTY_IDE_FORM, IDE_FIELD_MAX, escapeHtml, firstInvalidField, textToParagraphHtml, toIdePayload, validateIde } =
  await import('@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.logic');
const { submitIde } = await import('@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.source');

// test-only: pesan per isian berbeda agar terlihat pesan mana yang dipakai.
const messages = {
  required: {
    name: 'Isi nama.',
    alamat: 'Isi alamat.',
    namaIde: 'Isi nama ide.',
    deskripsi: 'Isi deskripsi.',
    masalah: 'Isi masalah.',
    benefit: 'Isi manfaat.',
  },
  tooLong: (max: number) => `Maksimal ${max} karakter.`,
};
// test-only
const filled = {
  name: 'Made Uji',
  alamat: 'Banjar Uji',
  namaIde: 'Bank sampah',
  deskripsi: 'Mengumpulkan sampah plastik.',
  masalah: 'Sampah menumpuk',
  benefit: 'Lingkungan bersih',
};

describe('validateIde', () => {
  it('form kosong → semua isian wajib dengan pesan masing-masing; galat pertama = nama', () => {
    const errors = validateIde(EMPTY_IDE_FORM, messages);
    expect(errors).toEqual(messages.required);
    expect(Object.keys(errors)).toEqual(['name', 'alamat', 'namaIde', 'deskripsi', 'masalah', 'benefit']);
    expect(firstInvalidField(errors)).toBe('name');
  });

  it('spasi saja tetap kosong; melebihi batas → pesan maksimal', () => {
    const errors = validateIde({ ...filled, masalah: '   ', name: 'x'.repeat(IDE_FIELD_MAX.name + 1) }, messages);
    expect(errors).toEqual({ name: 'Maksimal 50 karakter.', masalah: 'Isi masalah.' });
    expect(firstInvalidField(errors)).toBe('name');
  });

  it('form lengkap → tanpa galat', () => {
    expect(validateIde(filled, messages)).toEqual({});
    expect(firstInvalidField({})).toBeUndefined();
  });
});

describe('escapeHtml & textToParagraphHtml', () => {
  it('escape 5 karakter khusus', () => {
    expect(escapeHtml(`<b>"A" & 'B'</b>`)).toBe('&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
  });

  it('baris kosong memisah paragraf, baris tunggal → <br>, CRLF ditangani, paragraf kosong dibuang', () => {
    expect(textToParagraphHtml('Satu <script>x</script>\r\nbaris dua\r\n\r\n\n  Tiga  \n\n')).toBe(
      '<p>Satu &lt;script&gt;x&lt;/script&gt;<br>baris dua</p><p>Tiga</p>',
    );
    expect(textToParagraphHtml('   ')).toBe('');
  });
});

describe('toIdePayload', () => {
  it('deskripsi → paragraf HTML ter-escape; alamat di-escape; isian teks lain hanya di-trim', () => {
    expect(
      toIdePayload({ ...filled, name: ' Made <b> ', alamat: ' Banjar <i>Kaja</i> & "Tengah" ', namaIde: 'A & B', deskripsi: 'a\n\nb' }),
    ).toEqual({
      name: 'Made <b>',
      alamat: 'Banjar &lt;i&gt;Kaja&lt;/i&gt; &amp; &quot;Tengah&quot;',
      namaIde: 'A & B',
      deskripsi: '<p>a</p><p>b</p>',
      masalah: 'Sampah menumpuk',
      benefit: 'Lingkungan bersih',
    });
  });
});

describe('submitIde', () => {
  beforeEach(() => post.mockReset());

  it('mengirim body apa adanya; sukses → selesai tanpa galat', async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    await expect(submitIde(filled)).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith(filled);
  });

  it('HTTP gagal / success false → Error berkonteks status', async () => {
    post.mockResolvedValue({ status: 500, data: { success: false, message: 'Internal' } });
    await expect(submitIde(filled)).rejects.toThrow('Kirim ide inovatif gagal (HTTP 500): Internal');
    post.mockResolvedValue({ status: 200, data: null });
    await expect(submitIde(filled)).rejects.toThrow('Kirim ide inovatif gagal (HTTP 200): respons tidak valid');
  });
});
