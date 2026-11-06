// @vitest-environment node
// UI Link Toko Online: tombol publik (render server-side) + guard submit state admin.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

const { toastMock } = vi.hoisted(() => ({
  toastMock: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: toastMock }));

import { LinkTokoOnlineButtons } from '@/app/darmasaba/(pages)/ekonomi/umkm/_com/LinkTokoOnlineButtons';
import produkState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkmState/produk';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .trim();

describe('LinkTokoOnlineButtons (publik)', () => {
  it('tanpa link → tidak merender apa pun (tampilan lama tidak berubah)', () => {
    expect(render(<LinkTokoOnlineButtons links={[]} />)).toBe('');
    expect(render(<LinkTokoOnlineButtons links={undefined} />)).toBe('');
    expect(render(<LinkTokoOnlineButtons links={null} />)).toBe('');
  });

  it('merender tombol per link dengan target & rel aman, sesuai urutan', () => {
    const html = render(
      <LinkTokoOnlineButtons
        links={[
          { id: 'a', platform: 'TOKOPEDIA', url: 'https://www.tokopedia.com/toko' },
          { id: 'b', platform: 'SHOPEE', url: 'https://shopee.co.id/toko' },
        ]}
      />,
    );
    expect(html).toContain('href="https://www.tokopedia.com/toko"');
    expect(html).toContain('href="https://shopee.co.id/toko"');
    expect(html.match(/target="_blank"/g)).toHaveLength(2);
    expect(html.match(/rel="noopener noreferrer nofollow"/g)).toHaveLength(2);
    expect(html.indexOf('Tokopedia')).toBeLessThan(html.indexOf('Shopee'));
  });

  it('data tak aman (http/javascript/platform asing) tidak pernah dirender', () => {
    const html = render(
      <LinkTokoOnlineButtons
        links={[
          { platform: 'SHOPEE', url: 'http://shopee.co.id/x' },
          { platform: 'LAINNYA', url: 'javascript:alert(1)' },
          { platform: 'AMAZON', url: 'https://amazon.com/x' },
        ]}
      />,
    );
    expect(html).toBe('');
  });
});

describe('state admin produk — guard link toko online', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) });
    Object.assign(produkState.create.form, {
      nama: 'Produk', umkmId: 'u1', kategoriId: 'k1', harga: 1000, stok: 1,
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    produkState.create.form.linkTokoOnline = [];
  });

  it('link http ditolak di klien: tidak ada request, user diberi pesan', async () => {
    produkState.create.form.linkTokoOnline = [{ platform: 'SHOPEE', url: 'http://shopee.co.id/x' }];
    const ok = await produkState.create.submit();
    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith(expect.stringContaining('https'));
  });

  it('link valid ikut terkirim di body create', async () => {
    produkState.create.form.linkTokoOnline = [{ platform: 'SHOPEE', url: 'https://shopee.co.id/x' }];
    const ok = await produkState.create.submit();
    expect(ok).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.linkTokoOnline).toEqual([{ platform: 'SHOPEE', url: 'https://shopee.co.id/x' }]);
  });

  it('pesan gagal dari server ditampilkan, bukan diam', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: false, message: 'Maksimal 5 link' }) });
    const ok = await produkState.create.submit();
    expect(ok).toBe(false);
    expect(toastMock.error).toHaveBeenCalledWith('Maksimal 5 link');
  });
});
