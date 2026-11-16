// @vitest-environment node
// Developer Console › Log: label aksi audit lengkap, parser User-Agent, label role/hasil, query rentang tanggal.
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ default: {} }));

import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_OPTIONS,
  auditActionColor,
  auditActionLabel,
  auditTargetLabel,
} from '@/app/dev/log/audit-labels';
import {
  LOGIN_RESULT_LABELS,
  dateRangeParams,
  deviceLabel,
  formatAuditMeta,
  logListQuery,
  loginResultColor,
  loginResultLabel,
  roleLabel,
} from '@/app/dev/log/log.logic';
import { AUDIT_ACTIONS } from '@/lib/audit';
import { LOGIN_LOG_RESULTS } from '@/lib/login-log';

describe('label aksi audit', () => {
  it('setiap AUDIT_ACTIONS punya label Indonesia yang unik, tanpa label yatim', () => {
    const actions = Object.values(AUDIT_ACTIONS);
    for (const action of actions) expect(AUDIT_ACTION_LABELS[action]?.trim(), action).toBeTruthy();
    expect([...AUDIT_ACTION_OPTIONS].sort()).toEqual([...actions].sort());
    expect(new Set(Object.values(AUDIT_ACTION_LABELS)).size).toBe(actions.length);
  });

  it('aksi tak dikenal ditampilkan apa adanya; prototype tidak bocor', () => {
    expect(auditActionLabel('user.role.update')).toBe('Ubah role pengguna');
    expect(auditActionLabel('legacy.action')).toBe('legacy.action');
    expect(auditActionLabel('toString')).toBe('toString');
    expect(auditTargetLabel('laporan_publik')).toBe('Laporan publik');
    expect(auditTargetLabel('constructor')).toBe('constructor');
  });

  it('warna badge per jenis aksi', () => {
    expect(auditActionColor('user.delete')).toBe('red');
    expect(auditActionColor('jenna.provider.key.delete')).toBe('red');
    expect(auditActionColor('role.create')).toBe('green');
    expect(auditActionColor('user.activate')).toBe('green');
    expect(auditActionColor('user.deactivate')).toBe('orange');
    expect(auditActionColor('jenna.conversation.view')).toBe('gray');
    expect(auditActionColor('user.update')).toBe('blue');
  });
});

describe('deviceLabel (User-Agent ringkas)', () => {
  it.each([
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Chrome · Windows',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
      'Edge · Windows',
    ],
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      'Safari · macOS',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      'Safari · iOS',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
      'Chrome · iOS',
    ],
    [
      'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
      'Samsung Internet · Android',
    ],
    [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      'Chrome · Android',
    ],
    ['Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0', 'Firefox · Linux'],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0',
      'Opera · Windows',
    ],
    [
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Chrome · ChromeOS',
    ],
    ['curl/8.7.1', 'Tidak dikenal'],
  ])('%s → %s', (ua, expected) => {
    expect(deviceLabel(ua)).toBe(expected);
  });

  it('kosong → tanda pisah', () => {
    expect(deviceLabel(null)).toBe('—');
    expect(deviceLabel('   ')).toBe('—');
  });
});

describe('label role & hasil login', () => {
  it('roleLabel', () => {
    expect(roleLabel('0')).toBe('Developer');
    expect(roleLabel('5')).toBe('User');
    expect(roleLabel('9')).toBe('Role 9');
    expect(roleLabel(null)).toBe('—');
  });

  it('setiap LOGIN_LOG_RESULTS punya label; ditolak berwarna merah', () => {
    expect(Object.keys(LOGIN_RESULT_LABELS).sort()).toEqual([...LOGIN_LOG_RESULTS].sort());
    expect(loginResultLabel('blocked_inactive')).toBe('Ditolak: akun nonaktif');
    expect(loginResultLabel('unknown')).toBe('unknown');
    expect(loginResultColor('success')).toBe('green');
    expect(loginResultColor('blocked_inactive')).toBe('red');
  });
});

describe('query daftar log', () => {
  it('dateRangeParams: awal hari tanggal awal s.d. akhir hari tanggal akhir (zona browser)', () => {
    expect(dateRangeParams([null, null])).toEqual({});
    expect(dateRangeParams(['2026-11-01', '2026-11-16'])).toEqual({
      from: new Date(2026, 10, 1).toISOString(),
      to: new Date(2026, 10, 16, 23, 59, 59, 999).toISOString(),
    });
    expect(dateRangeParams(['2026-11-05', null])).toEqual({
      from: new Date(2026, 10, 5).toISOString(),
      to: new Date(2026, 10, 5, 23, 59, 59, 999).toISOString(),
    });
  });

  it('logListQuery: nilai kosong/null tidak dikirim, teks dipangkas', () => {
    expect(logListQuery({ page: 2, action: null, q: '  budi ', from: undefined, result: '' })).toBe('page=2&q=budi');
  });

  it('formatAuditMeta: JSON terformat; kosong → null', () => {
    expect(formatAuditMeta({ from: '5', to: '2' })).toBe('{\n  "from": "5",\n  "to": "2"\n}');
    expect(formatAuditMeta(null)).toBeNull();
    expect(formatAuditMeta({})).toBeNull();
  });
});
