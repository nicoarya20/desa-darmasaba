// @vitest-environment node
// Halaman PPID Permohonan Informasi Publik + Permohonan Keberatan: alur bernomor bersama, formulir satu kolom,
// toolbar editor alasan yang dipangkas. jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup
// dan aturan tata letak dibaca langsung dari file CSS module.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
// test-only: opsi dropdown fiktif berbentuk respons find-many.
vi.mock('@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik', () => {
  const options = (name: string) => ({ findMany: { data: [{ id: `${name}-1`, name: `Opsi ${name}` }], load: vi.fn() } });
  return {
    default: {
      statepermohonanInformasiPublik: { create: { form: {}, create: vi.fn() } },
      jenisInformasiDiminta: options('jenis'),
      caraMemperolehInformasi: options('cara'),
      caraMemperolehSalinanInformasi: options('salinan'),
    },
  };
});
vi.mock('@/app/admin/(dashboard)/_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi', () => ({
  default: { create: { form: {}, create: vi.fn() } },
}));

import { PPIDTextEditor } from '@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor';
import { PermohonanSteps } from '@/app/(public)/(pages)/ppid/_com/PermohonanSteps';
import InformasiPage from '@/app/(public)/(pages)/ppid/permohonan-informasi-publik/page';
import KeberatanPage from '@/app/(public)/(pages)/ppid/permohonan-keberatan-informasi-publik/page';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;
const css = readFileSync(
  path.join(process.cwd(), 'src/app/(public)/(pages)/ppid/_com/permohonan.module.css'),
  'utf8',
);

const informasi = render(<InformasiPage />);
const keberatan = render(<KeberatanPage />);

describe('PermohonanSteps — alur bernomor bersama', () => {
  const html = render(
    <PermohonanSteps
      title="Alur Uji"
      steps={[
        { title: 'Pertama', desc: 'Keterangan pertama.' },
        { title: 'Kedua', desc: 'Keterangan kedua.' },
      ]}
    />,
  );

  it('daftar berurutan dengan satu butir per langkah, nomor mengikuti urutan', () => {
    expect(count(html, '<ol')).toBe(1);
    expect(count(html, '<li')).toBe(2);
    expect(html).toMatch(/aria-hidden="true">1<\/span>[\s\S]*Pertama[\s\S]*aria-hidden="true">2<\/span>[\s\S]*Kedua/);
  });

  it('judul alur = h2 yang melabeli section, judul langkah = h3', () => {
    const id = html.match(/<h2 id="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${id}"`);
    expect(html).toContain('>Alur Uji</h2>');
    expect(count(html, '<h3')).toBe(2);
  });
});

describe.each([
  {
    name: 'Permohonan Informasi Publik',
    html: informasi,
    stepsTitle: 'Tata Cara Permohonan',
    steps: ['Ajukan Permohonan', 'Isi Formulir', 'Proses oleh PPID', 'Penyampaian Informasi'],
    formTitle: 'Formulir Permohonan Informasi',
  },
  {
    name: 'Permohonan Keberatan Informasi Publik',
    html: keberatan,
    stepsTitle: 'Alur Pengajuan Keberatan',
    steps: ['Isi Formulir', 'Verifikasi Data', 'Proses Keberatan', 'Hasil Dikirim'],
    formTitle: 'Formulir Keberatan',
  },
])('$name — susunan halaman', ({ name, html, stepsTitle, steps, formTitle }) => {
  it('satu h1 dari kepala halaman PPID bersama dan satu tombol kembali', () => {
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(`>${name}</h1>`);
    expect(count(html, 'aria-label="Kembali ke halaman sebelumnya"')).toBe(1);
  });

  it('keempat langkah tampil berurutan di alur bersama dengan isi teks lama', () => {
    expect(html).toContain(`>${stepsTitle}</h2>`);
    expect(count(html, '<li')).toBe(4);
    const idx = steps.map((title) => html.indexOf(`>${title}</h3>`));
    idx.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('tanpa kartu di dalam kartu: tidak ada Paper Mantine, hanya satu kartu formulir', () => {
    expect(html).not.toContain('mantine-Paper-root');
    expect(count(html, /class="_card_/)).toBe(1);
    expect(html).toContain(`>${formTitle}</h2>`);
  });

  it('tanpa teks tengah/justify', () => {
    expect(html).not.toMatch(/text-align:\s*(center|justify)/);
  });

  it('tombol kirim nonaktif selama formulir kosong', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*Kirim Permohonan/);
  });
});

describe('Permohonan Informasi Publik — kolom isian', () => {
  it('ketiga dropdown tidak lagi dibungkus Group (yang menyempitkannya) dan bertanda wajib', () => {
    expect(informasi).not.toContain('mantine-Group-root');
    ['Jenis Informasi', 'Cara Memperoleh Informasi', 'Cara Memperoleh Salinan Informasi'].forEach((label) =>
      expect(informasi).toMatch(new RegExp(`>${label}<span[^>]*mantine-InputWrapper-required`)),
    );
  });

  it('semua kolom isian berukuran sama (md)', () => {
    const sizes = [...informasi.matchAll(/<div[^>]*mantine-InputWrapper-root[^>]*data-size="(\w+)"/g)].map((m) => m[1]);
    expect(sizes).toHaveLength(8);
    expect(new Set(sizes)).toEqual(new Set(['md']));
  });
});

describe('Permohonan Keberatan — editor alasan & kontak', () => {
  const labels = (html: string) =>
    [...html.matchAll(/mantine-RichTextEditor-control[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);

  it('toolbar halaman publik hanya tebal, miring, dan daftar', () => {
    expect(labels(keberatan)).toEqual(['Bold', 'Italic', 'Bullet list', 'Ordered list']);
  });

  it('toolbar bawaan editor (dipakai admin) tetap lengkap', () => {
    const full = labels(render(<PPIDTextEditor onChange={() => undefined} showSubmit={false} />));
    expect(full.length).toBeGreaterThan(20);
    expect(full).toEqual(expect.arrayContaining(['Bold', 'Underline', 'Heading 1', 'Link', 'Align text: center', 'Undo']));
  });

  it('alasan keberatan berlabel wajib dengan penghitung karakter', () => {
    expect(keberatan).toMatch(/>Alasan Keberatan<span[^>]*mantine-InputWrapper-required/);
    expect(keberatan).toContain('0/2000 karakter');
  });

  it('kontak PPID tampil sebagai daftar istilah dengan nilai lama apa adanya', () => {
    expect(keberatan).toContain('>Kontak PPID</h2>');
    expect(keberatan).toMatch(/<dt>Email<\/dt><dd>desadarmasaba@badungkab\.go\.id<\/dd>/);
    expect(keberatan).toMatch(/<dt>WhatsApp<\/dt><dd>081-xxx-xxx-xxx<\/dd>/);
  });
});

describe('Tata letak permohonan — CSS', () => {
  const desktop = css.match(/@media \(min-width: 75em\) \{([\s\S]*?)\n\}/);

  it('2 kolom + alur menempel hanya di ≥75em (breakpoint lg tema, ditulis literal)', () => {
    expect(desktop?.[1]).toMatch(/grid-template-columns:/);
    expect(desktop?.[1]).toMatch(/position: sticky;/);
    expect(css.replace(desktop?.[0] ?? '', '')).not.toMatch(/position: sticky/);
    expect(css).not.toMatch(/@media[^{]*\$mantine-breakpoint/);
  });

  it('lebar hanya dibatasi di 2 kolom, lewat token bersama --ppid-measure; saat bertumpuk kartu selebar isi', () => {
    const maxWidths = [...css.matchAll(/^\s*max-width:\s*([^;]+);$/gm)].map((m) => m[1]);
    expect(maxWidths).toEqual(['var(--ppid-measure, 75rem)']);
    expect(desktop?.[1]).toMatch(/\.layout \{[^}]*max-width: var\(--ppid-measure, 75rem\);/);
  });

  it('posisi tempel memperhitungkan tinggi navbar desktop', () => {
    expect(css).toMatch(/--permohonan-sticky-top: calc\(44px \+ 32px\);/);
    expect(desktop?.[1]).toMatch(/top: var\(--permohonan-sticky-top\);/);
  });

  it('tanpa gradasi, tanpa rata tengah/justify, dan satu-satunya latar berwarna adalah kartu putih', () => {
    expect(css).not.toMatch(/gradient|text-align:\s*(center|justify)/);
    const backgrounds = [...css.matchAll(/background:\s*([^;]+);/g)].map((m) => m[1]);
    expect(backgrounds).toEqual(['var(--permohonan-line)', '#fff']);
  });
});
