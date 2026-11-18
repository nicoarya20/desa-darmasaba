// @vitest-environment node
// Lomba 2.5: potongan UI admin PPID untuk berkas dan gambar alur (tautan berkas per baris, field gambar alur).
// Klik/unggah tidak teruji (jsdom rusak); yang diuji adalah markup untuk berkas ada/kosong.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

import { BerkasLink } from '@/app/admin/(dashboard)/ppid/daftar-informasi-publik/_com/BerkasLink';
import { LembagaGambarField } from '@/app/admin/(dashboard)/ppid/profil-ppid/_com/lembaga/LembagaGambarField';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('BerkasLink (admin daftar informasi publik)', () => {
  it('ada berkas: tautan ke tab baru bernama berkas', () => {
    const html = render(<BerkasLink file={{ link: '/api/fileStorage/findUnique/a.pdf', realName: 'a.pdf' }} />); // test-only
    expect(html).toContain('href="/api/fileStorage/findUnique/a.pdf"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('>a.pdf</a>');
  });

  it.each([null, undefined])('tanpa berkas (%s): tanda "-" tanpa tautan', (file) => {
    const html = render(<BerkasLink file={file} />);
    expect(html).toContain('>-<');
    expect(html).not.toContain('<a ');
  });
});

describe('LembagaGambarField (admin profil lembaga)', () => {
  it('tanpa gambar: dropzone saja, tanpa pratinjau dan tombol lepas', () => {
    const html = render(<LembagaGambarField previewUrl={null} onPick={() => {}} onRemove={() => {}} />);
    expect(html).toContain('Gambar Alur');
    expect(html).toContain('Seret gambar atau klik untuk memilih');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('Lepas gambar alur');
  });

  it('ada gambar: pratinjau dan tombol lepas bernama jelas', () => {
    const html = render(<LembagaGambarField previewUrl="/api/img/alur.png" onPick={() => {}} onRemove={() => {}} />);
    expect(html).toMatch(/<img[^>]*src="\/api\/img\/alur\.png"/);
    expect(html).toContain('aria-label="Lepas gambar alur"');
  });
});
