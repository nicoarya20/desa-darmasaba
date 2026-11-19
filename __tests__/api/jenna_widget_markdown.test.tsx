// @vitest-environment node
// Markdown jawaban Jenna: link aman, tanpa HTML mentah, struktur list/bold. Render via renderToStaticMarkup (pola navbar_baca_suara).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { classifyHref, parseJennaMarkdown } from '@/app/(public)/_com/jenna/jenna-markdown.logic';
import { JennaMarkdown } from '@/app/(public)/_com/jenna/JennaMarkdown';
import { JennaRoom } from '@/app/(public)/_com/jenna/JennaRoom';
import { JENNA_DISCLAIMER, JENNA_QUICK_CHATS } from '@/app/(public)/_com/jenna/jenna-bar.logic';
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

describe('JennaRoom (render statis)', () => {
  const renderRoom = (open = true) =>
    renderToStaticMarkup(
      <MantineProvider>
        <JennaRoom open={open} onCollapse={() => {}} sendCtx={() => ({ pageContext: { route: '/', title: 'Beranda' } })} />
      </MantineProvider>,
    );
  const buttonTag = (html: string, label: string) => new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`).exec(html)?.[0] ?? '';

  it('header: judul ber-id sebagai nama region, subjudul, dua tombol berlabel; reset nonaktif saat kosong', () => {
    jennaState.reset();
    jennaState.assistantName = 'Jenna';
    const html = renderRoom();
    const titleId = /<h2[^>]*id="([^"]+)"[^>]*>Jenna<\/h2>/.exec(html)?.[1];
    expect(titleId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${titleId}"`);
    expect(html).toContain('Asisten Desa Darmasaba');
    expect(buttonTag(html, 'Mulai percakapan baru')).toMatch(/disabled/);
    const collapse = buttonTag(html, 'Perkecil percakapan');
    expect(collapse).not.toBe('');
    expect(collapse).not.toMatch(/disabled/);
  });

  it('room tidak lagi memuat saran, disclaimer, maupun komposer', () => {
    jennaState.reset();
    const html = renderRoom();
    expect(html).not.toContain(JENNA_DISCLAIMER);
    for (const s of JENNA_QUICK_CHATS) expect(html).not.toContain(s);
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('name="website"');
  });

  it('terbuka vs tertutup: tertutup = inert + aria-hidden, terbuka tanpa keduanya', () => {
    jennaState.reset();
    const closed = /<section[^>]*>/.exec(renderRoom(false))?.[0] ?? '';
    expect(closed).toContain('aria-hidden="true"');
    expect(closed).toMatch(/\sinert(=""|\s|>)/);
    expect(closed).toContain('data-open="false"');
    const opened = /<section[^>]*>/.exec(renderRoom(true))?.[0] ?? '';
    expect(opened).not.toMatch(/\sinert(=""|\s|>)/);
    expect(opened).toContain('aria-hidden="false"');
    expect(opened).toContain('data-open="true"');
  });

  it('pesan: tombol reset aktif, sumber sebagai link aman, error dengan Kirim ulang + hitung mundur, aria-live', () => {
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
      { id: 'u2', role: 'user', text: 'Lagi', status: 'done', modality: 'voice' },
      { id: 'a2', role: 'assistant', text: 'Jenna sedang sibuk.', status: 'error', errorCode: 'busy', retryAt: Date.now() + 10_000 },
    ];
    const html = renderRoom();
    expect(buttonTag(html, 'Mulai percakapan baru')).not.toMatch(/disabled/);
    expect(html).toContain('Jam buka?');
    expect(html).toContain('<strong>08.00</strong>');
    expect(html).toContain('aria-label="Diucapkan"');
    expect(html).toContain('Sumber');
    expect(html).toContain('href="/pemerintahan/profil"');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('Jahat');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>.*Kirim ulang<\/button>/);
    expect(html).toMatch(/coba lagi dalam (9|10) detik/);
    expect(html).toMatch(/aria-live="polite"[^>]*>Jenna sedang sibuk\.</);
    jennaState.reset();
  });

  it('jawaban sedang disiapkan: status memuat berperan status dengan teks server', () => {
    jennaState.messages = [
      { id: 'u1', role: 'user', text: 'Agenda?', status: 'done' },
      { id: 'a1', role: 'assistant', text: '', status: 'streaming' },
    ];
    jennaState.statusText = 'Mencari agenda…';
    const html = renderRoom();
    expect(html).toMatch(/role="status"[^>]*>.*Mencari agenda…/);
    jennaState.reset();
  });
});
