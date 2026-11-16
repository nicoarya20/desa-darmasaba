// @vitest-environment node
// Logika murni halaman Developer › Jenna › Percakapan, alasan widget tersembunyi, dan label Batas Pemakaian.
import { describe, expect, it } from 'vitest';
import { LIMIT_FIELDS } from '@/app/dev/jenna/jenna-form.logic';
import { publicWidgetHiddenReason } from '@/app/dev/jenna/jenna-status.logic';
import {
  errorCodeLabel,
  pageAfterDelete,
  pageCount,
  rangeLabel,
  tokenBudgetUsage,
} from '@/app/dev/jenna/percakapan/percakapan.logic';

describe('tokenBudgetUsage', () => {
  it('kuota 0 = Jenna tidak aktif di website publik', () => {
    expect(tokenBudgetUsage(500, 0)).toEqual({
      percent: 0,
      tone: 'neutral',
      label: 'Kuota token 0 — Jenna tidak aktif di website publik.',
    });
  });

  it('nada ok < 80%, warn ≥ 80%, error ≥ 100%', () => {
    expect(tokenBudgetUsage(0, 1000).tone).toBe('ok');
    expect(tokenBudgetUsage(799, 1000).tone).toBe('ok');
    expect(tokenBudgetUsage(800, 1000).tone).toBe('warn');
    expect(tokenBudgetUsage(1000, 1000).tone).toBe('error');
  });

  it('percent dibatasi 0–100 walau pemakaian melewati kuota', () => {
    const u = tokenBudgetUsage(2500, 1000);
    expect(u.percent).toBe(100);
    expect(u.label).toBe('dari 1.000 token (250%)');
  });

  it('pemakaian kecil tampil "<1%", bukan 0%', () => {
    expect(tokenBudgetUsage(1, 1000).label).toBe('dari 1.000 token (<1%)');
    expect(tokenBudgetUsage(0, 1000).label).toBe('dari 1.000 token (0%)');
  });
});

describe('paginasi', () => {
  it('pageCount minimal 1', () => {
    expect(pageCount(0, 20)).toBe(1);
    expect(pageCount(20, 20)).toBe(1);
    expect(pageCount(21, 20)).toBe(2);
  });

  it('rangeLabel', () => {
    expect(rangeLabel(1, 20, 0)).toBe('0 dari 0');
    expect(rangeLabel(1, 20, 5)).toBe('1–5 dari 5');
    expect(rangeLabel(2, 20, 57)).toBe('21–40 dari 57');
    expect(rangeLabel(3, 20, 57)).toBe('41–57 dari 57');
  });

  it('pageAfterDelete mundur bila halaman terakhir jadi kosong', () => {
    expect(pageAfterDelete(3, 20, 40)).toBe(2);
    expect(pageAfterDelete(3, 20, 41)).toBe(3);
    expect(pageAfterDelete(1, 20, 0)).toBe(1);
  });
});

describe('errorCodeLabel', () => {
  it.each([
    ['timeout', 'Waktu habis'],
    ['client_closed', 'Pengunjung menutup sebelum selesai'],
    ['internal', 'Galat internal'],
    ['provider_rate_limit', 'Galat provider (rate_limit)'],
    ['lainnya', 'lainnya'],
  ])('%s → %s', (code, label) => {
    expect(errorCodeLabel(code)).toBe(label);
  });

  it('null → "Gagal"', () => {
    expect(errorCodeLabel(null)).toBe('Gagal');
  });
});

describe('publicWidgetHiddenReason', () => {
  const ok = { enabled: true, providerReady: true, dailyTokensGlobal: 1000 };

  it('null bila widget tampil', () => {
    expect(publicWidgetHiddenReason(ok)).toBeNull();
  });

  it('alasan sesuai syarat GET /api/jenna/status, urutan nonaktif → provider → kuota', () => {
    expect(publicWidgetHiddenReason({ ...ok, enabled: false, providerReady: false })).toMatch(/nonaktif/);
    expect(publicWidgetHiddenReason({ ...ok, providerReady: false, dailyTokensGlobal: 0 })).toMatch(/provider/);
    expect(publicWidgetHiddenReason({ ...ok, dailyTokensGlobal: 0 })).toMatch(/kuota token harian masih 0/);
  });
});

describe('label Batas Pemakaian', () => {
  const hint = (key: string) => LIMIT_FIELDS.find((f) => f.key === key)!.hint;

  it('rate limit & kuota pesan dihitung per sesi dan per IP', () => {
    expect(hint('rateLimitPerMinute')).toMatch(/per sesi pengunjung dan per IP/);
    expect(hint('dailyMessagesUser')).toMatch(/per sesi pengunjung dan per IP/);
  });

  it('kuota token 0 = Jenna tidak aktif di website publik (bukan tanpa batas)', () => {
    expect(hint('dailyTokensGlobal')).toMatch(/0 = Jenna tidak aktif di website publik/);
    expect(hint('dailyTokensGlobal')).not.toMatch(/tanpa batas/);
  });

  it('retensi menyebut penghapusan otomatis harian', () => {
    expect(hint('retentionDays')).toMatch(/dihapus otomatis setiap hari/);
  });
});
