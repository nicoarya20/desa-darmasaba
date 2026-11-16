// @vitest-environment node
// Audit log terpasang di developer Jenna, Laporan Publik, dan visibilitas menu: dicatat hanya setelah
// mutasi sukses (aktor dari sesi, bukan body), tidak pernah saat 401/403/400, dan meta tanpa rahasia/PII.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const KEY = 'e'.repeat(64);
const SECRET = 'sk-audit-secret-1234567890WXYZ';
const PERSONA = 'Catatan persona rahasia untuk warga';

const { requireAuthMock, optionalAuthMock, envMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  optionalAuthMock: vi.fn(),
  envMock: { NODE_ENV: 'production', JENNA_CREDENTIALS_KEY: '', BETTER_AUTH_SECRET: 'x' },
  prismaMock: {
    $transaction: vi.fn(async (ops: unknown[]) => ops),
    auditLog: { create: vi.fn() },
    jennaSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    jennaProvider: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    jennaConversation: { findUnique: vi.fn(), deleteMany: vi.fn() },
    laporanPublik: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    penangananLaporanPublik: { deleteMany: vi.fn() },
    menuVisibility: { upsert: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock(), optionalAuth: () => optionalAuthMock() }));
vi.mock('@/lib/env', () => ({ env: envMock }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));

import {
  jennaProviderKeyDelete,
  jennaProviderTest,
  jennaProviderUpdate,
  jennaSettingsUpdate,
} from '@/app/api/[[...slugs]]/_lib/developer/jenna';
import { jennaVoiceProviderKeyDelete, jennaVoiceProviderUpdate } from '@/app/api/[[...slugs]]/_lib/developer/jenna-voice';
import {
  jennaConversationDelete,
  jennaConversationGet,
  jennaConversationsList,
} from '@/app/api/[[...slugs]]/_lib/developer/jenna-conversations';
import laporanPublikUpdate from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/updt';
import laporanPublikDelete from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/del';
import menuVisibilityUpdate from '@/app/api/[[...slugs]]/_lib/menu_visibility/update';

function ctx({ body, params = {} }: { body?: unknown; params?: Record<string, string> } = {}) {
  const set: { status?: number; headers: Record<string, string> } = { headers: {} };
  return { context: { body, params, query: {}, set } as unknown as Context, set };
}
const DEV = { id: 'u-0', email: 'dev@desa.id', roleId: '0', isActive: true };
const asUser = (user: { id: string; roleId: string; email?: string; isActive: boolean }) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user });
const unauthenticated = () =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
  });

type AuditData = { action: string; targetType: string; targetId: string | null; actorId: string | null; summary: string; meta?: Record<string, unknown> };
const auditCalls = () => prismaMock.auditLog.create.mock.calls.map((c) => (c[0] as { data: AuditData }).data);
const onlyAudit = () => {
  const calls = auditCalls();
  expect(calls).toHaveLength(1);
  return calls[0];
};

const settingsRow = (over: Record<string, unknown> = {}) => ({
  id: 'global',
  enabled: false,
  assistantName: 'Jenna',
  personaNote: '',
  updatedAt: new Date('2026-11-15T00:00:00Z'),
  updatedById: 'u-0',
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  envMock.JENNA_CREDENTIALS_KEY = KEY;
  asUser(DEV);
  optionalAuthMock.mockResolvedValue({ id: 'a-1', email: 'admin@desa.id', roleId: '1', isActive: true });
  prismaMock.auditLog.create.mockResolvedValue({});
  prismaMock.jennaSettings.findUnique.mockResolvedValue(null);
  prismaMock.jennaSettings.upsert.mockResolvedValue({});
  prismaMock.jennaProvider.findMany.mockResolvedValue([]);
  prismaMock.jennaProvider.findUnique.mockResolvedValue(null);
  prismaMock.jennaProvider.upsert.mockResolvedValue({});
  prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.menuVisibility.upsert.mockImplementation((args: unknown) => ({ op: 'upsert', args }));
  prismaMock.menuVisibility.deleteMany.mockImplementation((args: unknown) => ({ op: 'deleteMany', args }));
  prismaMock.menuVisibility.findMany.mockResolvedValue([]);
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('developer Jenna', () => {
  const JENNA_MUTATIONS = [
    ['PUT settings', () => jennaSettingsUpdate(ctx({ body: { enabled: true } }).context)],
    ['PUT provider', () => jennaProviderUpdate(ctx({ body: { baseUrl: 'https://api.openai.com/v1', model: 'm' }, params: { slot: 'chat_openai' } }).context)],
    ['DELETE provider key', () => jennaProviderKeyDelete(ctx({ params: { slot: 'chat_openai' } }).context)],
    ['PUT voice provider', () => jennaVoiceProviderUpdate(ctx({ body: { baseUrl: 'https://live.example.com/v1', model: 'gpt-realtime' } }).context)],
    ['DELETE voice key', () => jennaVoiceProviderKeyDelete(ctx().context)],
    ['GET conversation', () => jennaConversationGet(ctx({ params: { id: 'c1' } }).context)],
    ['DELETE conversation', () => jennaConversationDelete(ctx({ params: { id: 'c1' } }).context)],
  ] as const;

  it.each(JENNA_MUTATIONS)('%s: tanpa sesi (401) / role non-developer (403) → tidak diaudit', async (_name, run) => {
    unauthenticated();
    await run();
    asUser({ id: 'u-1', roleId: '1', isActive: true });
    await run();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('simpan settings: nama field yang berubah saja, nilai personaNote tidak disalin; aktor dari sesi', async () => {
    prismaMock.jennaSettings.findUnique
      .mockResolvedValueOnce(settingsRow())
      .mockResolvedValueOnce(settingsRow({ enabled: true, personaNote: PERSONA }));
    const res = await jennaSettingsUpdate(
      ctx({ body: { enabled: true, assistantName: 'Jenna', personaNote: PERSONA, actorId: 'palsu' } }).context,
    );
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({
      action: 'jenna.settings.update',
      targetType: 'jenna_settings',
      targetId: 'global',
      actorId: 'u-0',
      meta: { fields: ['enabled', 'personaNote'] },
    });
    expect(JSON.stringify(data)).not.toContain(PERSONA);
  });

  it('settings tidak valid (400) → tidak diaudit', async () => {
    const { context, set } = ctx({ body: { rateLimitPerMinute: 0 } });
    await jennaSettingsUpdate(context);
    expect(set.status).toBe(400);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('simpan provider: slot, model, host Base URL, apiKeyChanged — API key tidak pernah tercatat', async () => {
    const body = { baseUrl: 'https://api.openai.com/v1/', model: 'gpt-6-luna', apiKey: SECRET };
    const res = await jennaProviderUpdate(ctx({ body, params: { slot: 'chat_openai' } }).context);
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({
      action: 'jenna.provider.update',
      targetType: 'jenna_provider',
      targetId: 'chat_openai',
      actorId: 'u-0',
      meta: { slot: 'chat_openai', model: 'gpt-6-luna', baseUrlHost: 'api.openai.com', apiKeyChanged: true },
    });
    expect(Object.keys(data.meta ?? {}).sort()).toEqual(['apiKeyChanged', 'baseUrlHost', 'model', 'slot']);
    expect(JSON.stringify(data)).not.toContain(SECRET);
    expect(JSON.stringify(data)).not.toContain('WXYZ');
  });

  it('simpan provider tanpa apiKey → apiKeyChanged false', async () => {
    await jennaProviderUpdate(ctx({ body: { baseUrl: 'https://api.openai.com/v1', model: 'm' }, params: { slot: 'chat_openai' } }).context);
    expect(onlyAudit().meta).toMatchObject({ apiKeyChanged: false });
  });

  it('provider: slot tak dikenal (404), body tidak valid (400), apiKey tanpa kunci enkripsi (400) → tidak diaudit', async () => {
    await jennaProviderUpdate(ctx({ body: { baseUrl: 'https://a.com', model: 'm' }, params: { slot: 'voice' } }).context);
    await jennaProviderUpdate(ctx({ body: { baseUrl: 'bukan-url', model: 'm' }, params: { slot: 'chat_openai' } }).context);
    envMock.JENNA_CREDENTIALS_KEY = '';
    const { context, set } = ctx({ body: { baseUrl: 'https://a.com', model: 'm', apiKey: SECRET }, params: { slot: 'chat_openai' } });
    await jennaProviderUpdate(context);
    expect(set.status).toBe(400);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('hapus key provider → jenna.provider.key.delete dengan meta slot', async () => {
    await jennaProviderKeyDelete(ctx({ params: { slot: 'chat_anthropic' } }).context);
    expect(onlyAudit()).toMatchObject({
      action: 'jenna.provider.key.delete',
      targetId: 'chat_anthropic',
      actorId: 'u-0',
      meta: { slot: 'chat_anthropic' },
    });
  });

  it('tes koneksi provider tidak diaudit', async () => {
    await jennaProviderTest(ctx({ params: { slot: 'chat_openai' } }).context);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('simpan provider suara → jenna.voice.provider.update tanpa API key', async () => {
    const body = { baseUrl: 'https://live.example.com/v1', model: 'gpt-realtime', apiKey: SECRET };
    const res = await jennaVoiceProviderUpdate(ctx({ body }).context);
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({
      action: 'jenna.voice.provider.update',
      targetId: 'voice',
      meta: { slot: 'voice', model: 'gpt-realtime', baseUrlHost: 'live.example.com', apiKeyChanged: true },
    });
    expect(JSON.stringify(data)).not.toContain(SECRET);
  });

  it('provider suara tidak valid (400) → tidak diaudit', async () => {
    const { context, set } = ctx({ body: { baseUrl: 'bukan-url', model: 'gpt-realtime' } });
    await jennaVoiceProviderUpdate(context);
    expect(set.status).toBe(400);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('hapus key provider suara → jenna.voice.provider.key.delete', async () => {
    await jennaVoiceProviderKeyDelete(ctx().context);
    expect(onlyAudit()).toMatchObject({ action: 'jenna.voice.provider.key.delete', targetId: 'voice', meta: { slot: 'voice' } });
  });

  it('buka detail percakapan → jenna.conversation.view hanya dengan id, isi pesan tidak tercatat', async () => {
    prismaMock.jennaConversation.findUnique.mockResolvedValue({
      id: 'c1',
      createdAt: new Date('2026-11-15T00:00:00Z'),
      lastMessageAt: new Date('2026-11-15T00:01:00Z'),
      sessionHash: 'a'.repeat(64),
      ipHash: 'b'.repeat(64),
      messages: [
        {
          role: 'user',
          content: 'Nomor HP saya 081234567890',
          status: 'ok',
          errorCode: null,
          inputTokens: 1,
          outputTokens: 1,
          toolsUsed: [],
          latencyMs: 10,
          providerSlot: 'chat_openai',
          model: 'm',
          errorDetail: null,
          createdAt: new Date('2026-11-15T00:00:30Z'),
        },
      ],
    });
    const res = await jennaConversationGet(ctx({ params: { id: 'c1' } }).context);
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({
      action: 'jenna.conversation.view',
      targetType: 'jenna_conversation',
      targetId: 'c1',
      actorId: 'u-0',
      meta: { conversationId: 'c1' },
    });
    expect(JSON.stringify(data)).not.toContain('081234567890');
  });

  it('detail percakapan: id tidak valid (400) / tidak ada (404) → tidak diaudit; daftar percakapan tidak diaudit', async () => {
    await jennaConversationGet(ctx({ params: { id: 'bukan id!' } }).context);
    prismaMock.jennaConversation.findUnique.mockResolvedValue(null);
    await jennaConversationGet(ctx({ params: { id: 'c404' } }).context);
    await jennaConversationsList(ctx().context).catch(() => undefined);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('hapus percakapan → jenna.conversation.delete; tidak ada (404) → tidak diaudit', async () => {
    prismaMock.jennaConversation.deleteMany.mockResolvedValueOnce({ count: 0 });
    await jennaConversationDelete(ctx({ params: { id: 'c404' } }).context);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();

    prismaMock.jennaConversation.deleteMany.mockResolvedValueOnce({ count: 1 });
    await jennaConversationDelete(ctx({ params: { id: 'c1' } }).context);
    expect(onlyAudit()).toMatchObject({ action: 'jenna.conversation.delete', targetId: 'c1', meta: { conversationId: 'c1' } });
  });
});

describe('Laporan Publik', () => {
  const BODY = {
    judul: 'Sampah liar',
    lokasi: 'Banjar Tengah',
    tanggalWaktu: '2026-11-05T02:00:00.000Z',
    kronologi: '<p>Pelapor Budi melihat pembuangan sampah</p>',
    penanganan: '',
  };

  beforeEach(() => {
    prismaMock.laporanPublik.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'lap-1', ...data }));
  });

  it('status berubah → laporan_publik.status.update {fromStatus,toStatus}; isi laporan tidak tercatat', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValue({ status: 'Baru' });
    const res = await laporanPublikUpdate(ctx({ body: { ...BODY, status: 'Proses' }, params: { id: 'lap-1' } }).context);
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({
      action: 'laporan_publik.status.update',
      targetType: 'laporan_publik',
      targetId: 'lap-1',
      actorId: 'a-1',
      meta: { fromStatus: 'Baru', toStatus: 'Proses' },
    });
    expect(JSON.stringify(data)).not.toMatch(/Budi|Sampah liar|Banjar Tengah/);
  });

  it('status sama (hanya field lain berubah) → tidak diaudit', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValue({ status: 'Proses' });
    await laporanPublikUpdate(ctx({ body: { ...BODY, status: 'Proses' }, params: { id: 'lap-1' } }).context);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('update gagal → tidak diaudit', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValue({ status: 'Baru' });
    prismaMock.laporanPublik.update.mockRejectedValueOnce(new Error('P2025'));
    await expect(
      laporanPublikUpdate(ctx({ body: { ...BODY, status: 'Selesai' }, params: { id: 'lap-x' } }).context),
    ).rejects.toThrow();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('hapus → laporan_publik.delete {status}; tidak ditemukan → tidak diaudit', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValueOnce(null);
    await laporanPublikDelete(ctx({ params: { id: 'lap-x' } }).context);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();

    prismaMock.laporanPublik.findUnique.mockResolvedValueOnce({ id: 'lap-1', status: 'Gagal', judul: 'Sampah liar' });
    prismaMock.laporanPublik.delete.mockResolvedValueOnce({});
    const res = await laporanPublikDelete(ctx({ params: { id: 'lap-1' } }).context);
    expect(res).toMatchObject({ success: true });
    const data = onlyAudit();
    expect(data).toMatchObject({ action: 'laporan_publik.delete', targetId: 'lap-1', actorId: 'a-1', meta: { status: 'Gagal' } });
    expect(JSON.stringify(data)).not.toContain('Sampah liar');
  });

  it('hapus gagal di DB → tidak diaudit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.laporanPublik.findUnique.mockResolvedValueOnce({ id: 'lap-1', status: 'Baru' });
    prismaMock.laporanPublik.delete.mockRejectedValueOnce(new Error('db down'));
    const res = await laporanPublikDelete(ctx({ params: { id: 'lap-1' } }).context);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});

describe('visibilitas menu', () => {
  const ITEMS = [
    { menuKey: '/keamanan/cctv', isVisible: false },
    { menuKey: '/kesehatan/puskesmas', isVisible: null },
  ];

  it('sukses → menu_visibility.update dengan daftar {menuKey,isVisible}; aktor dari sesi', async () => {
    asUser({ id: 'u-1', roleId: '1', isActive: true });
    const res = await menuVisibilityUpdate(ctx({ body: { items: ITEMS } }).context);
    expect(res).toMatchObject({ success: true });
    expect(onlyAudit()).toMatchObject({
      action: 'menu_visibility.update',
      targetType: 'menu_visibility',
      actorId: 'u-1',
      meta: { items: ITEMS },
    });
  });

  it('401 / 403 / menuKey tidak dikenal (400) → tidak diaudit', async () => {
    unauthenticated();
    await menuVisibilityUpdate(ctx({ body: { items: ITEMS } }).context);
    asUser({ id: 'u-5', roleId: '5', isActive: true });
    await menuVisibilityUpdate(ctx({ body: { items: ITEMS } }).context);
    asUser(DEV);
    const { context, set } = ctx({ body: { items: [{ menuKey: '/tidak-ada', isVisible: true }] } });
    await menuVisibilityUpdate(context);
    expect(set.status).toBe(400);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});
