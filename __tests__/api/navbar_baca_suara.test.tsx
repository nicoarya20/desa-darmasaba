// @vitest-environment node
// Mode baca suara di navbar: keputusan teks yang dibacakan + tombol toggle (label & aria-pressed).
// jsdom rusak → renderToStaticMarkup; interaksi klik & speechSynthesis diverifikasi manual di browser.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { getSpeakableText, type SpeakableTarget } from '@/app/darmasaba/_com/hover-speech.logic';
import {
  NavbarSpeechToggle,
  SPEECH_LABEL_OFF,
  SPEECH_LABEL_ON,
} from '@/app/darmasaba/_com/NavbarSpeechToggle';
import stateHoverSpeech from '@/state/state-hover-speech';

// test-only: elemen tiruan tanpa DOM
const el = (tagName: string, innerText: string, insideButton = false): SpeakableTarget => ({
  tagName,
  innerText,
  closest: ((selector: string) => (insideButton && selector === 'button' ? ({} as Element) : null)) as SpeakableTarget['closest'],
});

const render = () => renderToStaticMarkup(<MantineProvider><NavbarSpeechToggle /></MantineProvider>);

afterEach(() => {
  stateHoverSpeech.active = false;
});

describe('getSpeakableText', () => {
  it('mengembalikan teks elemen biasa (dipangkas)', () => {
    expect(getSpeakableText(el('P', '  Selamat datang di Desa Darmasaba  '))).toBe('Selamat datang di Desa Darmasaba');
  });

  it('melewati tombol, ikon svg, dan isi di dalam tombol', () => {
    expect(getSpeakableText(el('BUTTON', 'Cari'))).toBeNull();
    expect(getSpeakableText(el('svg', 'ikon'))).toBeNull();
    expect(getSpeakableText(el('SPAN', 'Kembali', true))).toBeNull();
  });

  it('melewati target kosong atau tanpa teks', () => {
    expect(getSpeakableText(null)).toBeNull();
    expect(getSpeakableText(el('DIV', ''))).toBeNull();
    expect(getSpeakableText(el('DIV', '   \n '))).toBeNull();
  });
});

describe('NavbarSpeechToggle', () => {
  it('nonaktif: label ajakan mengaktifkan dan aria-pressed false', () => {
    const html = render();
    expect(html).toContain(`aria-label="${SPEECH_LABEL_OFF}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('type="button"');
  });

  it('aktif: label berganti dan aria-pressed true', () => {
    stateHoverSpeech.active = true;
    const html = render();
    expect(html).toContain(`aria-label="${SPEECH_LABEL_ON}"`);
    expect(html).toContain('aria-pressed="true"');
  });
});
