// @vitest-environment node
// Logika murni halaman Developer › Jenna › Pengetahuan dan contoh catatan persona.
import { describe, expect, it } from 'vitest';
import { identityErrors } from '@/app/dev/jenna/jenna-form.logic';
import {
  TIER_META,
  TIER_ORDER,
  groupSourcesByTier,
  revalidateMinutes,
  snapshotSizeUsage,
  sourcesSummary,
} from '@/app/dev/jenna/pengetahuan/pengetahuan.logic';
import { JENNA_PERSONA_PRESET, shouldConfirmPersonaPreset } from '@/app/dev/jenna/persona-preset';
import type { JennaKnowledgeSourceDTO } from '@/lib/jenna/knowledge-types';
import { JENNA_SETTINGS_LIMITS } from '@/lib/jenna/types';

const src = (key: string, tier: JennaKnowledgeSourceDTO['tier'], over: Partial<JennaKnowledgeSourceDTO> = {}) =>
  ({ key, label: key, domain: 'layanan', tier, visible: true, href: '/x', rows: 3, take: 10, searchable: false, ...over }) satisfies JennaKnowledgeSourceDTO;

describe('snapshotSizeUsage', () => {
  it('di bawah 80% → ok, label memakai format angka Indonesia', () => {
    expect(snapshotSizeUsage(45_000, 90_000, false)).toEqual({
      percent: 50,
      tone: 'ok',
      label: '45.000 dari 90.000 karakter (50%)',
    });
  });

  it('≥ 80% → warn; persen dibulatkan ke bawah', () => {
    expect(snapshotSizeUsage(72_000, 90_000, false).tone).toBe('warn');
    expect(snapshotSizeUsage(71_999, 90_000, false)).toMatchObject({ tone: 'ok', label: '71.999 dari 90.000 karakter (79%)' });
  });

  it('terpotong → error walau ukurannya di bawah batas', () => {
    expect(snapshotSizeUsage(89_500, 90_000, true).tone).toBe('error');
    expect(snapshotSizeUsage(10, 90_000, true).tone).toBe('error');
  });

  it('persen bar selalu 0–100; di bawah 1% ditulis <1', () => {
    expect(snapshotSizeUsage(120_000, 90_000, true).percent).toBe(100);
    expect(snapshotSizeUsage(0, 90_000, false)).toMatchObject({ percent: 0, label: '0 dari 90.000 karakter (0%)' });
    expect(snapshotSizeUsage(100, 90_000, false).label).toBe('100 dari 90.000 karakter (<1%)');
  });
});

describe('revalidateMinutes', () => {
  it('detik → menit, minimal 1', () => {
    expect(revalidateMinutes(1800)).toBe(30);
    expect(revalidateMinutes(90)).toBe(2);
    expect(revalidateMinutes(10)).toBe(1);
  });
});

describe('groupSourcesByTier / sourcesSummary', () => {
  const sources = [
    src('berita', 'C', { searchable: true }),
    src('sejarah', 'A'),
    src('apbdes', 'D', { rows: 5 }),
    src('pengumuman', 'C'),
    src('puskesmas', 'A', { visible: false, rows: 0 }),
  ];

  it('urutan tier A → D, urutan dalam tier dipertahankan, tier kosong dilewati', () => {
    expect(groupSourcesByTier(sources).map((g) => [g.tier, g.sources.map((s) => s.key)])).toEqual([
      ['A', ['sejarah', 'puskesmas']],
      ['C', ['berita', 'pengumuman']],
      ['D', ['apbdes']],
    ]);
    expect(groupSourcesByTier([])).toEqual([]);
  });

  it('setiap tier punya label & keterangan', () => {
    for (const tier of TIER_ORDER) {
      expect(TIER_META[tier].label).toBeTruthy();
      expect(TIER_META[tier].hint).toBeTruthy();
    }
  });

  it('ringkasan: total, terlihat, tersembunyi, jumlah baris', () => {
    expect(sourcesSummary(sources)).toEqual({ total: 5, visible: 4, hidden: 1, rows: 14 });
    expect(sourcesSummary([])).toEqual({ total: 0, visible: 0, hidden: 0, rows: 0 });
  });
});

describe('JENNA_PERSONA_PRESET', () => {
  it('muat dalam batas catatan persona dan lolos validasi form', () => {
    expect(JENNA_PERSONA_PRESET.length).toBeGreaterThan(0);
    expect(JENNA_PERSONA_PRESET.length).toBeLessThanOrEqual(JENNA_SETTINGS_LIMITS.personaNote.maxLength);
    expect(identityErrors({ assistantName: 'Jenna', personaNote: JENNA_PERSONA_PRESET })).toEqual({});
  });

  it('ditulis untuk website Desa Darmasaba dan mengarahkan saat tidak tahu', () => {
    expect(JENNA_PERSONA_PRESET).toContain('Desa Darmasaba');
    expect(JENNA_PERSONA_PRESET).toContain('Badung');
    expect(JENNA_PERSONA_PRESET).toMatch(/jangan menebak/i);
    expect(JENNA_PERSONA_PRESET).toMatch(/kantor desa/i);
  });

  it('tidak memuat kontak kantor (email, WhatsApp, nomor telepon) maupun tautan', () => {
    expect(JENNA_PERSONA_PRESET).not.toMatch(/@|whats\s?app|\bWA\b|telepon|telp|\bhp\b/i);
    expect(JENNA_PERSONA_PRESET).not.toMatch(/\d{5,}/);
    expect(JENNA_PERSONA_PRESET).not.toMatch(/https?:|www\./i);
  });

  it('tanpa karakter kontrol selain baris baru (aman diratakan prompt)', () => {
    expect(JENNA_PERSONA_PRESET).not.toMatch(/[\u0000-\u0009\u000B-\u001F\u007F]/);
  });
});

describe('shouldConfirmPersonaPreset', () => {
  it('kolom kosong / hanya spasi → langsung isi', () => {
    expect(shouldConfirmPersonaPreset('')).toBe(false);
    expect(shouldConfirmPersonaPreset('  \n ')).toBe(false);
  });

  it('sudah berisi teks lain → minta konfirmasi', () => {
    expect(shouldConfirmPersonaPreset('Jawab singkat.')).toBe(true);
  });

  it('sudah berisi contoh yang sama → tidak perlu konfirmasi', () => {
    expect(shouldConfirmPersonaPreset(`${JENNA_PERSONA_PRESET}\n`)).toBe(false);
  });
});
