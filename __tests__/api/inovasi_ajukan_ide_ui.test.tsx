// @vitest-environment node
// Ajukan Ide Inovatif: formulir langsung (tanpa bola lampu/modal) dalam tata letak 2 kolom PPID + kartu formulir Inovasi.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
import { AjukanIdePage } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/AjukanIdePage';
import { IdeFormView, type IdeFormViewProps } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/IdeFormView';
import { IdeThanks } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/IdeThanks';
import { EMPTY_IDE_FORM, IDE_FIELDS, validateIde } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.logic';
import { AJUKAN_IDE_TEXT as T } from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.text';
import { InovasiFormCard } from '@/app/(public)/(pages)/inovasi/_com/InovasiFormCard';
import f from '@/app/(public)/(pages)/inovasi/_com/inovasi-form.module.css';
import s from '@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const viewProps = (extra: Partial<IdeFormViewProps> = {}): IdeFormViewProps => ({
  idPrefix: 'ide',
  form: EMPTY_IDE_FORM,
  errors: {},
  shown: {},
  sending: false,
  failed: false,
  onChange: () => {},
  onBlur: () => {},
  onSubmit: () => {},
  ...extra,
});

describe('AjukanIdePage', () => {
  const html = render(<AjukanIdePage />);

  it('kepala h1 tanpa kolom cari; tanpa bola lampu, modal, atau ajakan "klik pada gambar"', () => {
    expect(html).toContain(`>${T.title}</h1>`);
    expect(html).not.toContain('role="search"');
    expect(html).not.toMatch(/klik pada gambar/i);
    expect(html).not.toContain('mantine-Modal');
  });

  it('kolom kiri: tujuan, alur setelah kirim, pengantar Musyawarah dengan tautan tetap', () => {
    for (const item of T.tujuan) expect(html).toContain(`<li>${item}</li>`);
    expect(html).toContain(`>${T.stepsTitle}</h2>`);
    expect(html).toContain('Ide Anda Bisa Dibahas di Musyawarah Desa');
    expect(html).toContain('href="/pemerintahan/event-budaya"');
    expect(html).toContain('href="/pemerintahan/monev-pembangunan"');
  });

  it('formulir langsung tampil: 6 isian, deskripsi/masalah/manfaat = textarea, bukan editor admin', () => {
    expect(html).toContain(`>${T.formTitle}</h2>`);
    for (const name of ['name', 'alamat', 'namaIde']) expect(html).toMatch(new RegExp(`<input[^>]*name="${name}"`));
    for (const name of ['deskripsi', 'masalah', 'benefit']) expect(html).toMatch(new RegExp(`<textarea[^>]*name="${name}"`));
    expect(html).not.toContain('tiptap');
    expect(html).toMatch(/maxlength="50"/i);
    expect(html).toContain('>Kirim ide<');
  });
});

describe('urutan bertumpuk', () => {
  it('di bawah 75em formulir (kolom main PermohonanLayout) dinaikkan ke atas aside lewat order', () => {
    expect(render(<AjukanIdePage />)).toContain(`<div class="${f.fullWidth} ${s.formFirst}">`);
    const css = readFileSync(
      path.join(process.cwd(), 'src/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/ajukan-ide.module.css'),
      'utf8',
    );
    expect(css).toMatch(/@media \(max-width: 74\.99em\) \{\s*\.formFirst > \* > :last-child \{\s*order: -1;/);
  });
});

describe('IdeFormView', () => {
  it('isian terkontrol: nilai form dirender ke value + hitungan karakter textarea', () => {
    const html = render(<IdeFormView {...viewProps({ form: { ...EMPTY_IDE_FORM, name: 'Made', deskripsi: 'abc' } })} />);
    expect(html).toMatch(/<input[^>]*name="name"[^>]*value="Made"|<input[^>]*value="Made"[^>]*name="name"/);
    expect(html).toContain(T.count(3, 2000));
  });

  it('galat hanya tampil untuk isian yang boleh tampil (shown)', () => {
    const errors = { name: T.required.name, alamat: T.required.alamat };
    const html = render(<IdeFormView {...viewProps({ errors, shown: { name: true } })} />);
    expect(html).toContain(T.required.name);
    expect(html).not.toContain(T.required.alamat);
    expect(html).toContain('aria-invalid="true"');
  });

  it('6 isian wajib bertanda * (seragam Administrasi Online)', () => {
    const html = render(<IdeFormView {...viewProps()} />);
    expect(html.match(/mantine-InputWrapper-required/g)).toHaveLength(IDE_FIELDS.length);
  });

  it('kirim kosong → pesan spesifik tiap isian (bukan "Wajib diisi."), tanpa em dash', () => {
    const errors = validateIde(EMPTY_IDE_FORM, { required: T.required, tooLong: T.tooLong });
    const html = render(<IdeFormView {...viewProps({ errors, shown: Object.fromEntries(IDE_FIELDS.map((k) => [k, true])) })} />);
    const messages = Object.values(T.required);
    expect(new Set(messages).size).toBe(IDE_FIELDS.length);
    for (const message of messages) {
      expect(html).toContain(message);
      expect(message).not.toMatch(/wajib diisi|—/i);
    }
  });

  it('kirim gagal → pesan role="alert"; tanpa gagal → tanpa alert', () => {
    expect(render(<IdeFormView {...viewProps({ failed: true })} />)).toContain(`role="alert">${T.error}</p>`);
    expect(render(<IdeFormView {...viewProps()} />)).not.toContain('role="alert"');
  });
});

describe('IdeThanks & InovasiFormCard', () => {
  it('terima kasih: judul bisa difokus (tabIndex -1) + aksi kirim ide lain', () => {
    const html = render(<IdeThanks onAgain={() => {}} />);
    expect(html).toMatch(/tabindex="-1"/i);
    // Kartu bersama dengan `focusTitle`: section berlabel judul, judul tanpa cincin fokus, lead di kepala kartu.
    expect(html).toMatch(new RegExp(`<section class="${f.card}" aria-labelledby="([^"]+)"><div class="${f.head}"><h2 id="\\1" tabindex="-1" class="${f.title} ${f.titleFocus}">`, 'i'));
    expect(html).toContain(`<p class="${f.lead}">${T.thanksText}</p>`);
    expect(html).toContain(T.thanksTitle);
    expect(html).toContain(T.again);
  });

  it('kartu formulir: section berlabel judul h2 + lead opsional', () => {
    const html = render(
      <InovasiFormCard title="Formulir uji" lead="Keterangan uji">
        <p>isi</p>
      </InovasiFormCard>,
    );
    expect(html).toMatch(new RegExp(`<section class="${f.card}" aria-labelledby="([^"]+)"><div class="${f.head}"><h2 id="\\1"`));
    expect(html).toContain('>Formulir uji</h2>');
    expect(html).toContain(`<p class="${f.lead}">Keterangan uji</p>`);
    expect(render(<InovasiFormCard title="Tanpa lead">x</InovasiFormCard>)).not.toContain(f.lead);
    // Kartu formulir biasa: judul tidak masuk urutan fokus program.
    expect(html).not.toMatch(/tabindex/i);
    expect(html).not.toContain(f.titleFocus);
  });
});
