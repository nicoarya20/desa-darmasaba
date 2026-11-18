// @vitest-environment node
// Juknis lomba 5.4: audit Lighthouse "Use efficient cache lifetimes" menandai 1,4-1,8 MB gambar /api/img yang masa
// cache-nya hanya 1-4 jam. Gambar bernama unik (nanoid, tak pernah ditimpa) → aman `immutable` setahun di browser;
// Cloudflare hanya sehari (`s-maxage`) agar gambar yang dihapus tak bertahan lama di tepi. Jawaban cadangan: no-store.
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const minioMock = vi.hoisted(() => ({ getObject: vi.fn() }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'bucket-test' }));

import img, {
  IMAGE_CACHE_CONTROL,
  IMAGE_FALLBACK_CACHE_CONTROL,
} from '@/app/api/[[...slugs]]/_lib/img';

const ROOT = process.cwd(); // memuat public/no-image.jpg
const SEPULUH_TAHUN = 10 * 365 * 24 * 3600;

/** Gambar webp kecil sungguhan agar jalur resize/convert sharp ikut teruji. */
async function webp() {
  return sharp({ create: { width: 8, height: 8, channels: 3, background: '#2a78d6' } }).webp().toBuffer();
}

const directive = (cc: string, name: string) => cc.split(',').map((p) => p.trim()).find((p) => p.startsWith(name));
const seconds = (cc: string, name: string) => Number(directive(cc, name)?.split('=')[1]);

beforeEach(() => vi.clearAllMocks());

describe('konstanta cache gambar', () => {
  it('browser: ≥1 tahun dan immutable; tepi Cloudflare: pendek (≤1 hari)', () => {
    expect(IMAGE_CACHE_CONTROL).toContain('public');
    expect(IMAGE_CACHE_CONTROL).toContain('immutable');
    expect(seconds(IMAGE_CACHE_CONTROL, 'max-age')).toBeGreaterThanOrEqual(365 * 24 * 3600);
    expect(seconds(IMAGE_CACHE_CONTROL, 's-maxage')).toBeLessThanOrEqual(24 * 3600);
    expect(seconds(IMAGE_CACHE_CONTROL, 'max-age')).toBeLessThan(SEPULUH_TAHUN);
  });

  it('jawaban cadangan tidak boleh disimpan', () => {
    expect(IMAGE_FALLBACK_CACHE_CONTROL).toBe('no-store');
  });
});

describe('img(): header Cache-Control', () => {
  it('gambar ditemukan → cache panjang + immutable + tipe sesuai', async () => {
    minioMock.getObject.mockResolvedValue(Readable.from([await webp()]));
    const res = await img({ name: 'abc123-desktop.webp', ROOT });
    expect(res.headers.get('Cache-Control')).toBe(IMAGE_CACHE_CONTROL);
    expect(res.headers.get('Content-Type')).toBe('image/webp');
    expect(minioMock.getObject).toHaveBeenCalledWith('bucket-test', 'image/abc123-desktop.webp');
  });

  it('?format=jpeg (browser lama) tetap cache panjang: kunci cache berbeda lewat URL', async () => {
    minioMock.getObject.mockResolvedValue(Readable.from([await webp()]));
    const res = await img({ name: 'abc123-desktop.webp', ROOT, format: 'jpeg' });
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
    expect(res.headers.get('Cache-Control')).toBe(IMAGE_CACHE_CONTROL);
  });

  it('?size= (resize) tetap cache panjang', async () => {
    minioMock.getObject.mockResolvedValue(Readable.from([await webp()]));
    const res = await img({ name: 'abc123-desktop.webp', ROOT, size: 4 });
    expect(res.headers.get('Cache-Control')).toBe(IMAGE_CACHE_CONTROL);
  });

  it('galat MinIO → gambar cadangan, no-store (tidak boleh tersimpan lama)', async () => {
    minioMock.getObject.mockRejectedValue(new Error('minio down'));
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await img({ name: 'abc123-desktop.webp', ROOT });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Cache-Control')).not.toContain('immutable');
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('ekstensi tidak didukung → gambar cadangan, no-store, MinIO tidak disentuh', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const res = await img({ name: 'dokumen.exe', ROOT });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(minioMock.getObject).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
