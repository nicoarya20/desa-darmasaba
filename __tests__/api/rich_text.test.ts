// @vitest-environment node
// src/lib/rich-text.ts: helper teks kaya bersama (Potensi Desa, Daftar Informasi Publik, Laporan Publik).
// Dipindah dari potensi.logic.ts tanpa ubah perilaku; DOMPurify (butuh DOM) diganti stub yang mencatat opsi.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sanitize = vi.hoisted(() => vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')));
vi.mock('dompurify', () => ({ default: { sanitize } }));

import { RICH_TEXT_TAGS, htmlToPlainText, sanitizeRichText } from '@/lib/rich-text';

beforeEach(() => {
  sanitize.mockClear();
});

describe('htmlToPlainText', () => {
  it('buang tag, pisahkan paragraf, decode entitas', () => {
    expect(htmlToPlainText('<p>Satu <strong>dua</strong></p><p>tiga&nbsp;&amp; &#8211; &lt;b&gt;</p>')).toBe('Satu dua tiga & – <b>');
  });

  it('kosong / null → string kosong', () => {
    expect(htmlToPlainText('<p></p>')).toBe('');
    expect(htmlToPlainText(null)).toBe('');
  });
});

describe('sanitizeRichText', () => {
  it('memakai DOMPurify dengan tag format dasar saja, tanpa atribut', () => {
    expect(sanitizeRichText('<p>a</p><script>x</script>')).toBe('<p>a</p>');
    expect(sanitize).toHaveBeenCalledWith('<p>a</p><script>x</script>', { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: [] });
  });

  it('daftar tag tetap sama dengan versi Potensi', () => {
    expect(RICH_TEXT_TAGS).toEqual(['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li']);
  });

  it('isian kosong dari editor dianggap tidak ada isi', () => {
    expect(sanitizeRichText('<p>&nbsp; </p>')).toBe('');
    expect(sanitizeRichText(undefined)).toBe('');
    expect(sanitize).not.toHaveBeenCalled();
  });
});
