// @vitest-environment node
// Komponen bersama unggah PDF admin (dipakai Dasar Hukum, Daftar Informasi Publik, SOP Layanan, dst.).
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import PdfDropzoneField from '@/app/admin/_com/upload/PdfDropzoneField';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

const render = (props: Partial<React.ComponentProps<typeof PdfDropzoneField>> = {}) =>
  renderToStaticMarkup(
    <MantineProvider>
      <PdfDropzoneField label="Berkas PDF" file={null} onChange={() => {}} {...props} />
    </MantineProvider>,
  );

describe('PdfDropzoneField', () => {
  it('menampilkan label dan petunjuk saat belum ada berkas', () => {
    const html = render();
    expect(html).toContain('Berkas PDF');
    expect(html).toContain('Seret PDF atau klik untuk memilih');
    expect(html).not.toContain('Batalkan pilihan berkas');
  });

  it('menampilkan nama berkas terpilih dan tombol batal', () => {
    const html = render({ file: new File(['x'], 'perbup.pdf', { type: 'application/pdf' }) });
    expect(html).toContain('perbup.pdf');
    expect(html).toContain('Batalkan pilihan berkas');
  });

  it('menampilkan tautan berkas saat ini hanya bila belum memilih berkas baru', () => {
    const currentFile = { link: 'https://files.example/a.pdf', realName: 'a.pdf' };
    expect(render({ currentFile })).toContain('href="https://files.example/a.pdf"');
    const picked = render({ currentFile, file: new File(['x'], 'b.pdf', { type: 'application/pdf' }) });
    expect(picked).not.toContain('Berkas saat ini');
  });

  it('menampilkan keterangan opsional', () => {
    expect(render({ description: 'Opsional' })).toContain('Opsional');
  });
});
