// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = readFileSync(
  path.resolve(__dirname, '../../src/app/darmasaba/(pages)/pemerintahan/layanan/_com/BackButto.tsx'),
  'utf8',
);

// Source-check (bukan import): komponen menarik next-view-transitions yang tidak bisa dimuat di env node Vitest.
const BACK_BUTTON_LABEL = SRC.match(/BACK_BUTTON_LABEL = "([^"]+)"/)?.[1];

// Tombol ikon tanpa teks harus punya nama aksesibel (Aspek 8 juknis lomba: aksesibilitas).
describe('BackButton aksesibilitas', () => {
  it('punya label pembaca layar yang bermakna', () => {
    expect(BACK_BUTTON_LABEL).toBe('Kembali ke halaman sebelumnya');
  });

  it('memasang label sebagai aria-label (dan title untuk tooltip mouse)', () => {
    expect(SRC).toMatch(/aria-label=\{BACK_BUTTON_LABEL\}/);
    expect(SRC).toMatch(/title=\{BACK_BUTTON_LABEL\}/);
  });

  it('ikon panah ditandai dekoratif agar tidak dibacakan ganda', () => {
    expect(SRC).toMatch(/<IconArrowLeft aria-hidden \/>/);
  });
});
