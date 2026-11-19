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
  JENNA_DISCLAIMER,
  JENNA_INPUT_PLACEHOLDER,
  JENNA_QUICK_CHATS,
  nextPlaceholderIndex,
  showCounter,
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

  it('nextPlaceholderIndex berputar ke awal dan aman untuk daftar kosong', () => {
    expect(nextPlaceholderIndex(0, 3)).toBe(1);
    expect(nextPlaceholderIndex(2, 3)).toBe(0);
    expect(nextPlaceholderIndex(5, 0)).toBe(0);
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
});

describe('JennaWidget (render statis)', () => {
  it('tidak merender apa pun saat Jenna belum aktif', () => {
    jennaState.status = 'disabled';
    // MantineProvider selalu memancarkan <style data-mantine-styles>; yang diuji hanya isi widget.
    expect(wrap(<JennaWidget />).replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')).toBe('');
  });

  it('idle: placeholder asli + teks bergilir aria-hidden, kirim nonaktif, tanpa quick chat & counter, honeypot', () => {
    enable();
    const html = wrap(<JennaWidget />);
    expect(dockMode(html)).toBe('idle');
    expect(html).toContain(`placeholder="${JENNA_INPUT_PLACEHOLDER}"`);
    expect(html).toContain('aria-label="Pertanyaan untuk Jenna"');
    expect(html).toMatch(new RegExp(`aria-hidden="true"[^>]*><span[^>]*>${esc(JENNA_QUICK_CHATS[0])}</span>`));
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*aria-label="Kirim pertanyaan"[^>]*disabled/);
    expect(html).not.toContain('aria-label="Pertanyaan cepat"');
    expect(html).not.toContain('/500');
    const honeypot = /<div[^>]*aria-hidden="true"[^>]*><label>Website(<input[^>]*>)/.exec(html)?.[1] ?? '';
    expect(honeypot).toContain('name="website"');
    expect(honeypot).toContain('tabindex="-1"');
    expect(honeypot).toMatch(/autocomplete="off"/i);
    // Disclaimer selalu ter-render (dianimasikan), tapi disembunyikan dari pembaca layar saat idle.
    expect(html).toMatch(new RegExp(`aria-hidden="true"><div[^>]*><p[^>]*>${esc(JENNA_DISCLAIMER)}</p>`));
  });

  it('expanded: 3 quick chat sebagai tombol, teks bergilir hilang, disclaimer terbaca', () => {
    enable();
    jennaState.barExpanded = true;
    const html = wrap(<JennaWidget />);
    expect(dockMode(html)).toBe('expanded');
    expect(html).toContain('aria-label="Pertanyaan cepat"');
    for (const q of JENNA_QUICK_CHATS) expect(html).toMatch(new RegExp(`<button type="button"[^>]*>${esc(q)}</button>`));
    expect(html).toMatch(new RegExp(`aria-hidden="false"><div[^>]*><p[^>]*>${esc(JENNA_DISCLAIMER)}</p>`));
    expect(countOf(html, JENNA_QUICK_CHATS[0])).toBe(1); // hanya pil, bukan placeholder bergilir
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

  it('mikrofon hanya tampil bila onVoice ada', () => {
    const withMic = wrap(<JennaComposer {...base} draft="" sending={false} voiceLabel="Bicara dengan Jenna" onVoice={() => {}} />);
    const without = wrap(<JennaComposer {...base} draft="" sending={false} voiceLabel="Bicara dengan Jenna" />);
    expect(withMic).toContain('aria-label="Bicara dengan Jenna"');
    expect(without).not.toContain('aria-label="Bicara dengan Jenna"');
  });
});
