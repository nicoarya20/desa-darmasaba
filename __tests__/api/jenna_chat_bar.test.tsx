// @vitest-environment node
// Chat bar Jenna (gaya Fin): logika murni + render statis bar (idle/expanded/room) dan composer. Pola: renderToStaticMarkup (jsdom rusak).
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/' })); // test-only
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => ({ currentSong: null }) })); // test-only

import {
  barMode,
  canCollapseToIdle,
  closeToIdle,
  isConversationReset,
  JENNA_DISCLAIMER,
  JENNA_INPUT_PLACEHOLDER,
  JENNA_QUICK_CHATS,
  showCounter,
  TYPING_TIMING,
  typingFrame,
} from '@/app/(public)/_com/jenna/jenna-bar.logic';
import jennaState from '@/app/(public)/_com/jenna/jenna.state';
import { JennaComposer } from '@/app/(public)/_com/jenna/JennaComposer';
import JennaWidget from '@/app/(public)/_com/jenna/JennaWidget';

const wrap = (node: ReactNode) => renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
const dockMode = (html: string) => /data-mode="(idle|expanded|room)"/.exec(html)?.[1];
const countOf = (html: string, text: string) => html.split(text).length - 1;
const esc = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const enable = () => {
  jennaState.reset();
  jennaState.status = 'enabled';
  jennaState.assistantName = 'Jenna';
  jennaState.maxInputChars = 500;
  jennaState.open = false;
  jennaState.barExpanded = false;
};

afterEach(() => {
  jennaState.reset();
  jennaState.status = 'loading';
  jennaState.open = false;
  jennaState.barExpanded = false;
});

describe('jenna-bar.logic', () => {
  it('3 quick chat sesuai arahan dan disclaimer tanpa em dash', () => {
    expect(JENNA_QUICK_CHATS).toEqual([
      'Jam pelayanan kantor desa?',
      'Apa syarat membuat surat keterangan?',
      'Agenda desa bulan ini?',
    ]);
    expect(JENNA_DISCLAIMER).toContain('Jangan kirim NIK');
    expect(JENNA_DISCLAIMER).not.toContain('—');
  });

  describe('typingFrame: ketik huruf demi huruf → jeda 3 dtk → langsung kosong → teks berikutnya', () => {
    const t = { typeMs: 50, holdMs: 1000 }; // test-only
    const texts = ['abc', 'de']; // test-only
    const segA = 3 * 50 + 1000; // 1150

    it('mulai kosong lalu huruf bertambah tiap typeMs; nextIn = sisa waktu ke huruf berikutnya', () => {
      expect(typingFrame(texts, 0, t)).toEqual({ index: 0, text: '', phase: 'typing', nextIn: 50 });
      expect(typingFrame(texts, 49, t)).toMatchObject({ text: '', nextIn: 1 });
      expect(typingFrame(texts, 50, t)).toMatchObject({ text: 'a', phase: 'typing' });
      expect(typingFrame(texts, 120, t)).toMatchObject({ text: 'ab', phase: 'typing', nextIn: 30 });
    });

    it('jeda selama holdMs saat lengkap, tanpa fase hapus mundur', () => {
      expect(typingFrame(texts, 150, t)).toEqual({ index: 0, text: 'abc', phase: 'hold', nextIn: 1000 });
      expect(typingFrame(texts, segA - 1, t)).toEqual({ index: 0, text: 'abc', phase: 'hold', nextIn: 1 });
    });

    it('teks lengkap langsung kosong lalu teks berikutnya diketik, berulang dari awal', () => {
      expect(typingFrame(texts, segA, t)).toEqual({ index: 1, text: '', phase: 'typing', nextIn: 50 });
      expect(typingFrame(texts, segA + 50, t)).toMatchObject({ index: 1, text: 'd' });
      const segB = 2 * 50 + 1000;
      expect(typingFrame(texts, segA + segB, t)).toMatchObject({ index: 0, text: '', phase: 'typing' });
      // Tak pernah ada potongan yang memendek di tengah satu teks (bukan hapus mundur).
      const lens = Array.from({ length: segA }, (_, ms) => typingFrame(texts, ms, t).text.length);
      expect(lens.every((n, i) => i === 0 || n >= lens[i - 1])).toBe(true);
    });

    it('tempo bawaan sesuai arahan (ketik 45-60 ms/huruf, jeda 3 dtk) dan daftar kosong aman', () => {
      expect(TYPING_TIMING.typeMs).toBeGreaterThanOrEqual(45);
      expect(TYPING_TIMING.typeMs).toBeLessThanOrEqual(60);
      expect(TYPING_TIMING.holdMs).toBe(3000);
      expect(typingFrame(JENNA_QUICK_CHATS, TYPING_TIMING.typeMs).text).toBe(JENNA_QUICK_CHATS[0][0]);
      expect(typingFrame([], 500)).toMatchObject({ text: '' });
    });
  });

  it('showCounter hanya saat draf ≥ 90% batas', () => {
    expect(showCounter(449, 500)).toBe(false);
    expect(showCounter(450, 500)).toBe(true);
    expect(showCounter(500, 500)).toBe(true);
    expect(showCounter(0, 0)).toBe(false);
  });

  it('barMode: room mengalahkan expanded', () => {
    expect(barMode(false, false)).toBe('idle');
    expect(barMode(false, true)).toBe('expanded');
    expect(barMode(true, false)).toBe('room');
    expect(barMode(true, true)).toBe('room');
  });

  it('canCollapseToIdle: tak kembali idle bila room terbuka, ada draf, atau suara aktif', () => {
    expect(canCollapseToIdle({ roomOpen: false, draft: '  ', voiceBusy: false })).toBe(true);
    expect(canCollapseToIdle({ roomOpen: true, draft: '', voiceBusy: false })).toBe(false);
    expect(canCollapseToIdle({ roomOpen: false, draft: 'halo', voiceBusy: false })).toBe(false);
    expect(canCollapseToIdle({ roomOpen: false, draft: '', voiceBusy: true })).toBe(false);
  });

  it('closeToIdle: perkecil/Escape menutup room DAN bar kembali idle; sesi suara menahan bar memanjang', () => {
    expect(closeToIdle(false)).toEqual({ open: false, barExpanded: false });
    expect(closeToIdle(true)).toEqual({ open: false, barExpanded: true });
  });

  it('isConversationReset: hanya saat jumlah pesan turun dari > 0 ke 0', () => {
    expect(isConversationReset(4, 0)).toBe(true);
    expect(isConversationReset(0, 0)).toBe(false);
    expect(isConversationReset(0, 2)).toBe(false);
    expect(isConversationReset(4, 2)).toBe(false);
  });
});

describe('JennaWidget (render statis)', () => {
  it('tidak merender apa pun saat Jenna belum aktif', () => {
    jennaState.status = 'disabled';
    // MantineProvider selalu memancarkan <style data-mantine-styles>; yang diuji hanya isi widget.
    expect(wrap(<JennaWidget />).replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')).toBe('');
  });

  it('idle: placeholder asli + hiasan ketik aria-hidden, kirim nonaktif, tanpa quick chat & counter, honeypot', () => {
    enable();
    const html = wrap(<JennaWidget />);
    expect(dockMode(html)).toBe('idle');
    expect(html).toContain(`placeholder="${JENNA_INPUT_PLACEHOLDER}"`);
    expect(html).toContain('aria-label="Pertanyaan untuk Jenna"');
    // Hiasan ketik tampil (teks ditulis timer di klien), petunjuk statis tersembunyi; keduanya aria-hidden.
    expect(html).toMatch(/<span class="[^"]*typing[^"]*" aria-hidden="true" data-show="true">/);
    expect(html).toMatch(new RegExp(`<span class="[^"]*hint[^"]*" aria-hidden="true" data-show="false">${esc(JENNA_INPUT_PLACEHOLDER)}</span>`));
    // Dock tetap selebar mode memanjang; kulit pil (clip-path) terpisah dari isi.
    expect(html).toMatch(/<div class="[^"]*skinWrap[^"]*" aria-hidden="true"><div class="[^"]*skin[^"]*"><\/div><\/div>/);
    expect(html).toMatch(/data-mode="idle"[^>]*tabindex="-1"/); // dock bisa menerima fokus terprogram
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*aria-label="Kirim pertanyaan"[^>]*disabled/);
    expect(html).not.toContain('aria-label="Pertanyaan cepat"');
    expect(html).not.toContain('/500');
    const honeypot = /<div[^>]*aria-hidden="true"[^>]*><label>Website(<input[^>]*>)/.exec(html)?.[1] ?? '';
    expect(honeypot).toContain('name="website"');
    expect(honeypot).toContain('tabindex="-1"');
    expect(honeypot).toMatch(/autocomplete="off"/i);
    // Disclaimer selalu ter-render (dianimasikan), tapi disembunyikan dari pembaca layar saat idle;
    // data-shown menggerakkan CSS chip (jenna-disclaimer.module.css).
    expect(html).toMatch(new RegExp(`data-shown="false" aria-hidden="true"><p[^>]*>${esc(JENNA_DISCLAIMER)}</p>`));
  });

  it('expanded: 3 quick chat sebagai tombol, hiasan ketik berganti petunjuk, disclaimer terbaca', () => {
    enable();
    jennaState.barExpanded = true;
    const html = wrap(<JennaWidget />);
    expect(dockMode(html)).toBe('expanded');
    expect(html).toContain('aria-label="Pertanyaan cepat"');
    for (const q of JENNA_QUICK_CHATS) expect(html).toMatch(new RegExp(`<button type="button"[^>]*>${esc(q)}</button>`));
    expect(html).toMatch(new RegExp(`data-shown="true" aria-hidden="false"><p[^>]*>${esc(JENNA_DISCLAIMER)}</p>`));
    expect(countOf(html, JENNA_QUICK_CHATS[0])).toBe(1); // hanya pil
    expect(html).toMatch(/typing[^"]*" aria-hidden="true" data-show="false">/);
    expect(html).toMatch(/hint[^"]*" aria-hidden="true" data-show="true">/);
  });

  it('room: quick chat disembunyikan saat percakapan terbuka', () => {
    enable();
    jennaState.barExpanded = true;
    jennaState.open = true;
    jennaState.messages = [
      { id: 'u1', role: 'user', text: 'Jam buka?', status: 'done' },
      { id: 'a1', role: 'assistant', text: 'Pukul 08.00.', status: 'done' },
    ];
    const html = wrap(<JennaWidget />);
    expect(dockMode(html)).toBe('room');
    expect(html).toMatch(new RegExp(`data-shown="true" aria-hidden="false"><p[^>]*>${esc(JENNA_DISCLAIMER)}</p>`));
    expect(html).not.toContain('aria-label="Pertanyaan cepat"');
    expect(html).toContain('Jam buka?');
  });
});

describe('JennaComposer (render statis)', () => {
  const base = {
    onDraftChange: () => {},
    maxChars: 500,
    rotate: false,
    website: '',
    onWebsiteChange: () => {},
    onSend: () => {},
    onStop: () => {},
    onFocus: () => {},
  };

  it('counter muncul di ≥ 90% batas; kirim aktif saat ada isi', () => {
    const html = wrap(<JennaComposer {...base} draft={'a'.repeat(450)} sending={false} />);
    expect(html).toMatch(/data-full="false">450\/500</);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*data-ready="true"[^>]*aria-label="Kirim pertanyaan"/);
    expect(html).not.toMatch(/aria-label="Kirim pertanyaan"[^>]*disabled/);
  });

  it('saat mengirim: tombol berhenti menggantikan kirim, mikrofon disembunyikan', () => {
    const html = wrap(
      <JennaComposer {...base} draft="" sending voiceLabel="Bicara dengan Jenna" onVoice={() => {}} />,
    );
    expect(html).toContain('aria-label="Hentikan jawaban"');
    expect(html).not.toContain('aria-label="Kirim pertanyaan"');
    expect(html).not.toContain('Bicara dengan Jenna');
  });

  it('hiasan placeholder hilang saat ada draf', () => {
    const html = wrap(<JennaComposer {...base} rotate draft="halo" sending={false} />);
    expect(html).not.toMatch(/typing[^"]*" aria-hidden/);
    expect(html).not.toMatch(/hint[^"]*" aria-hidden/);
    expect(html).toContain('data-blank="false"');
  });

  it('mikrofon hanya tampil bila onVoice ada', () => {
    const withMic = wrap(<JennaComposer {...base} draft="" sending={false} voiceLabel="Bicara dengan Jenna" onVoice={() => {}} />);
    const without = wrap(<JennaComposer {...base} draft="" sending={false} voiceLabel="Bicara dengan Jenna" />);
    expect(withMic).toContain('aria-label="Bicara dengan Jenna"');
    expect(without).not.toContain('aria-label="Bicara dengan Jenna"');
  });
});
