// @vitest-environment node
// `?page` di luar rentang pada daftar ber-paginasi server (Info TTG, Tips Keamanan): alihkan ke halaman terakhir
// yang valid, pesan "Belum ada" hanya bila total = 0.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { outOfRangePage, paginate } from '@/app/(public)/_com/kabar-list/kabar-list.logic';

const ready = (totalPages: number, total: number) => ({ status: 'ready' as const, totalPages, total });

describe('outOfRangePage', () => {
  it('halaman melewati totalPages padahal ada entri → halaman terakhir yang valid', () => {
    expect(outOfRangePage(ready(2, 11), 99)).toBe(2);
    expect(outOfRangePage(ready(1, 3), 2)).toBe(1);
  });

  it('halaman sah (termasuk halaman terakhir) → null', () => {
    expect(outOfRangePage(ready(2, 11), 1)).toBeNull();
    expect(outOfRangePage(ready(2, 11), 2)).toBeNull();
  });

  it('total = 0 → null (biarkan pesan "Belum ada" / "tidak ada yang cocok")', () => {
    expect(outOfRangePage(ready(1, 0), 99)).toBeNull();
  });

  it('memuat / galat → null (belum tahu jumlah halaman)', () => {
    expect(outOfRangePage({ status: 'loading' }, 99)).toBeNull();
    expect(outOfRangePage({ status: 'error' }, 99)).toBeNull();
  });

  it('totalPages 0 dari API tetap diarahkan ke halaman 1, bukan 0', () => {
    expect(outOfRangePage(ready(0, 4), 5)).toBe(1);
  });

  it('sejalan dengan paginate (klien): halaman di luar jangkauan → halaman terakhir', () => {
    expect(paginate(Array.from({ length: 11 }, (_, i) => i), 99, 10).page).toBe(outOfRangePage(ready(2, 11), 99));
  });
});

describe('pemakai: halaman Info TTG & Tips Keamanan mengalihkan lewat router.replace', () => {
  const pages = [
    ['src/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/InfoTtgPage.tsx', 'infoTtgListHref'],
    ['src/app/(public)/(pages)/keamanan/tips-keamanan/_com/TipsKeamananPage.tsx', 'tipsKeamananListHref'],
  ] as const;

  it.each(pages)('%s: replace ke halaman valid dengan kata kunci dipertahankan', (file, hrefFn) => {
    const src = readFileSync(path.join(process.cwd(), file), 'utf8');
    expect(src).toContain('const validPage = outOfRangePage(state, page);');
    expect(src).toContain(`router.replace(${hrefFn}({ search, page: validPage }))`);
  });
});
