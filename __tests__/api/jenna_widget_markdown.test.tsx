// @vitest-environment node
// Markdown jawaban Jenna: link aman, tanpa HTML mentah, struktur list/bold. Render via renderToStaticMarkup (pola navbar_baca_suara).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { classifyHref, parseJennaMarkdown } from '@/app/(public)/_com/jenna/jenna-markdown.logic';
import { JennaMarkdown } from '@/app/(public)/_com/jenna/JennaMarkdown';
import { JennaPanel } from '@/app/(public)/_com/jenna/JennaPanel';
import { JENNA_DISCLAIMER, JENNA_SUGGESTIONS } from '@/app/(public)/_com/jenna/JennaMessages';
import jennaState from '@/app/(public)/_com/jenna/jenna.state';

const render = (text: string) => renderToStaticMarkup(<MantineProvider><JennaMarkdown text={text} /></MantineProvider>);
const hrefs = (html: string) => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

describe('classifyHref', () => {
  it('menerima path internal dan https', () => {
    expect(classifyHref('/pemerintahan/layanan')).toBe('internal');
    expect(classifyHref('/')).toBe('internal');
    expect(classifyHref('https://badungkab.go.id/')).toBe('external');
  });

  it('menolak skema berbahaya, protocol-relative, dan http', () => {
    for (const href of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      '//evil.example/x',
      '/\\evil.example',
      'http://evil.example',
      'mailto:a@b.c',
      'vbscript:x',
      '#top',
      'https:/evil',
      '/ok\nbad',
    ]) {
      expect(classifyHref(href), href).toBeNull();
    }
  });
});

describe('JennaMarkdown', () => {
  it('link berbahaya dirender sebagai teks label saja', () => {
    const html = render('[klik](javascript:void0) [gambar](data:text/html,x) [luar](//evil.example)');
    expect(hrefs(html)).toEqual([]);
    expect(html).toContain('klik gambar luar');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('data:text');
    // Kurung di dalam href tidak cocok sintaks link → seluruhnya tetap teks literal, tanpa <a>.
    expect(hrefs(render('[klik](javascript:alert(1))'))).toEqual([]);
  });

  it('link internal tanpa target, link https di tab baru dengan noopener', () => {
    const html = render('Lihat [layanan](/pemerintahan/layanan) atau [Badung](https://badungkab.go.id).');
    expect(hrefs(html)).toEqual(['/pemerintahan/layanan', 'https://badungkab.go.id']);
    expect(html).toMatch(/<a[^>]*href="\/pemerintahan\/layanan"(?![^>]*target=)[^>]*>/);
    expect(html).toMatch(/<a[^>]*href="https:\/\/badungkab.go.id"[^>]*target="_blank"[^>]*>/);
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('HTML mentah tidak pernah dirender sebagai elemen', () => {
    const html = render('<script>alert(1)</script> <img src=x onerror=alert(1)> **<b>tebal</b>**');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('bold, italic, inline code, list berurut & tidak berurut, baris baru', () => {
    const html = render('Syarat **KTP** dan *KK*:\nbawa `fotokopi`\n\n- satu\n- dua\n\n1. pertama\n2. kedua');
    expect(html).toContain('<strong>KTP</strong>');
    expect(html).toContain('<em>KK</em>');
    expect(html).toMatch(/<code[^>]*>fotokopi<\/code>/);
    expect(html).toContain('<br/>');
    expect(html).toMatch(/<ul[^>]*>.*satu.*dua.*<\/ul>/);
    expect(html).toMatch(/<ol[^>]*>.*pertama.*kedua.*<\/ol>/);
  });

  it('penanda yang tidak ditutup tetap teks (aman saat streaming)', () => {
    expect(parseJennaMarkdown('**belum selesai')).toEqual([
      { type: 'paragraph', lines: [[{ type: 'text', value: '**belum selesai' }]] },
    ]);
    expect(render('5 * 3 = 15')).toContain('5 * 3 = 15');
  });

  it('heading markdown jadi teks tebal tanpa tanda #', () => {
    const html = render('## Jam Pelayanan\nSenin–Jumat');
    expect(html).not.toContain('##');
    expect(html).toContain('Jam Pelayanan');
  });
});

describe('JennaPanel (render statis)', () => {
  const renderPanel = () =>
    renderToStaticMarkup(
      <MantineProvider>
        <JennaPanel title={<h2>Jenna</h2>} onClose={() => {}} getPageContext={() => ({ route: '/', title: 'Beranda' })} />
      </MantineProvider>,
    );

  it('keadaan kosong: disclaimer, 4 chip saran, honeypot tersembunyi, penghitung karakter', () => {
    jennaState.reset();
    jennaState.maxInputChars = 500;
    const html = renderPanel();
    expect(html).toContain(JENNA_DISCLAIMER);
    expect(JENNA_SUGGESTIONS).toHaveLength(4);
    for (const s of JENNA_SUGGESTIONS) expect(html).toContain(s);
    const honeypot = /<div[^>]*aria-hidden="true"[^>]*><label>Website(<input[^>]*>)/.exec(html)?.[1] ?? '';
    expect(honeypot).toContain('name="website"');
    expect(honeypot).toContain('tabindex="-1"');
    expect(honeypot).toMatch(/autocomplete="off"/i);
    expect(html).toContain('0/500');
    expect(html).toContain('Mulai baru');
  });

  it('pesan: sumber sebagai link aman, error dengan tombol Kirim ulang + hitung mundur, aria-live', () => {
    jennaState.messages = [
      { id: 'u1', role: 'user', text: 'Jam buka?', status: 'done' },
      {
        id: 'a1',
        role: 'assistant',
        text: 'Buka **08.00**.',
        status: 'done',
        sources: [
          { title: 'Profil Desa', url: '/pemerintahan/profil' },
          { title: 'Jahat', url: 'javascript:alert(1)' },
        ],
      },
      { id: 'u2', role: 'user', text: 'Lagi', status: 'done' },
      { id: 'a2', role: 'assistant', text: 'Jenna sedang sibuk.', status: 'error', errorCode: 'busy', retryAt: Date.now() + 10_000 },
    ];
    const html = renderPanel();
    expect(html).toContain('Sumber');
    expect(html).toContain('href="/pemerintahan/profil"');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('Jahat');
    expect(html).toContain('Kirim ulang');
    expect(html).toMatch(/coba lagi dalam (9|10) detik/);
    expect(html).toMatch(/aria-live="polite"[^>]*>Jenna sedang sibuk\.</);
    jennaState.reset();
  });
});
