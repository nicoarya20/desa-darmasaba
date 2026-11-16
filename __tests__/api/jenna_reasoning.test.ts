// @vitest-environment node
// Resolver reasoning effort slot chat_openai: Otomatis dari nama model, "off", dan manual.
import { describe, expect, it } from 'vitest';
import { autoReasoningEffort, describeReasoning, resolveReasoningEffort } from '@/lib/jenna/reasoning';

describe('resolveReasoningEffort — Otomatis (setting null)', () => {
  it.each([
    ['gpt-6-luna', 'none'],
    ['gpt-6', 'none'],
    ['gpt-7-mini', 'none'],
    ['gpt-5.4-nano', 'none'],
    ['gpt-5.6-luna', 'none'],
    ['gpt-5.1', 'none'],
    ['  GPT-6-Luna  ', 'none'],
    ['gpt-5', 'low'],
    ['gpt-5-mini', 'low'],
    ['gpt-5-nano', 'low'],
    ['o1', 'low'],
    ['o3', 'low'],
    ['o4-mini', 'low'],
    ['O4-MINI', 'low'],
    ['gpt-4o-mini', null],
    ['gpt-4.1-mini', null],
    ['gpt-4o', null],
    ['gpt-10', 'none'],
    ['gpt-5o', null],
    ['openai/gpt-6-luna', null],
    ['llama-3.1-70b', null],
    ['omni-moderation', null],
    ['', null],
  ] as const)('%s → %s', (model, expected) => {
    expect(resolveReasoningEffort(model, null)).toBe(expected);
    expect(resolveReasoningEffort(model, undefined)).toBe(expected);
    expect(autoReasoningEffort(model)).toBe(expected);
  });

  it('setelan tak dikenal diperlakukan Otomatis (sama dengan DTO)', () => {
    expect(resolveReasoningEffort('gpt-6-luna', 'turbo')).toBe('none');
    expect(resolveReasoningEffort('gpt-4o-mini', '')).toBeNull();
  });
});

describe('resolveReasoningEffort — off & manual', () => {
  it('"off" tidak pernah mengirim, termasuk untuk model reasoning', () => {
    for (const model of ['gpt-6-luna', 'o4-mini', 'gpt-4o-mini']) expect(resolveReasoningEffort(model, 'off')).toBeNull();
  });

  it('manual dikirim apa adanya untuk model apa pun', () => {
    for (const effort of ['none', 'low', 'medium', 'high'] as const) {
      expect(resolveReasoningEffort('gpt-4o-mini', effort)).toBe(effort);
      expect(resolveReasoningEffort('gpt-6-luna', effort)).toBe(effort);
    }
  });
});

describe('describeReasoning', () => {
  it('keterangan Otomatis, manual, off, dan model kosong', () => {
    expect(describeReasoning('gpt-6-luna', null)).toBe(
      'Otomatis: model reasoning terdeteksi — dikirim reasoning effort "none", temperature diabaikan.',
    );
    expect(describeReasoning('o4-mini', '')).toContain('"low"');
    expect(describeReasoning('gpt-4o-mini', null)).toBe('Otomatis: model biasa — reasoning effort tidak dikirim.');
    expect(describeReasoning('gpt-6-luna', 'off')).toContain('tidak dikirim');
    expect(describeReasoning('gpt-4o-mini', 'medium')).toBe('Manual: dikirim reasoning effort "medium", temperature diabaikan.');
    expect(describeReasoning('  ', null)).toBe('Otomatis: isi model untuk melihat setelan yang dipakai.');
  });
});
