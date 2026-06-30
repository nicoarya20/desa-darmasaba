// @vitest-environment node
// Fungsi murni (tanpa DOM) — pakai node env, hindari masalah jsdom/cssstyle pada runner default.
import { describe, it, expect } from 'vitest';
import { buildConsentUrl, DEFAULT_SCOPE } from '@/app/api/auth/_lib/google/oauth_client';
import { mapUserInfoToUser } from '@/app/api/auth/_lib/google/user_resolver';
import { redirectByRole, PROFILE_PATH } from '@/app/api/auth/_lib/google/redirect_by_role';
import { getRequestOrigin } from '@/app/api/auth/_lib/google/request_origin';

describe('buildConsentUrl', () => {
  const base = {
    clientId: 'my-client-id',
    redirectUri: 'http://localhost:3000/api/auth/google/callback',
    state: 'abc123',
  };

  it('points to Google authorize endpoint with required params', () => {
    const url = new URL(buildConsentUrl(base));
    expect(url.host).toBe('accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('my-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(base.redirectUri);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('abc123');
    expect(url.searchParams.get('scope')).toBe(DEFAULT_SCOPE);
  });

  it('requests openid email profile scope', () => {
    const url = new URL(buildConsentUrl(base));
    expect(url.searchParams.get('scope')).toBe('openid email profile');
  });
});

describe('mapUserInfoToUser', () => {
  it('maps Google userinfo fields to app user fields', () => {
    const mapped = mapUserInfoToUser({
      id: 'g-1',
      email: 'a@b.com',
      name: 'Alice',
      picture: 'http://img/a.png',
    });
    expect(mapped).toEqual({
      googleId: 'g-1',
      email: 'a@b.com',
      avatarUrl: 'http://img/a.png',
      username: 'Alice',
    });
  });

  it('falls back username to email when name missing', () => {
    const mapped = mapUserInfoToUser({ id: 'g-2', email: 'c@d.com' });
    expect(mapped.username).toBe('c@d.com');
    expect(mapped.email).toBe('c@d.com');
    expect(mapped.avatarUrl).toBeNull();
  });

  it('falls back username to id when name and email missing', () => {
    const mapped = mapUserInfoToUser({ id: 'g-3' });
    expect(mapped.username).toBe('g-3');
    expect(mapped.email).toBeNull();
  });
});

describe('redirectByRole', () => {
  it('routes admin roles 0/1/2 to program inovasi dashboard', () => {
    for (const role of ['0', '1', '2']) {
      expect(redirectByRole(role)).toBe('/admin/landing-page/profil/program-inovasi');
    }
  });

  it('routes role 3 (kesehatan) and 4 (pendidikan) to their dashboards', () => {
    expect(redirectByRole('3')).toBe('/admin/kesehatan/posyandu/list-posyandu');
    expect(redirectByRole('4')).toBe('/admin/pendidikan/info-sekolah/jenjang-pendidikan');
  });

  it('routes USER role 5 (and beyond) to public profile', () => {
    expect(redirectByRole('5')).toBe(PROFILE_PATH);
    expect(redirectByRole(5)).toBe('/profile');
    expect(redirectByRole('9')).toBe(PROFILE_PATH);
  });
});

describe('getRequestOrigin', () => {
  const req = (headers: Record<string, string>) =>
    new Request('http://localhost:3000/api/auth/google/callback', { headers });

  it('uses X-Forwarded-* headers set by the proxy', () => {
    const origin = getRequestOrigin(
      req({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'desa-darmasaba-stg.wibudev.com' }),
    );
    expect(origin).toBe('https://desa-darmasaba-stg.wibudev.com');
  });

  it('falls back to host header when forwarded host absent', () => {
    const origin = getRequestOrigin(req({ host: 'example.com' }));
    expect(origin).toBe('https://example.com');
  });

  it('takes the first entry when a header carries a proxy-chain list', () => {
    const origin = getRequestOrigin(
      req({ 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'public.com, internal:3000' }),
    );
    expect(origin).toBe('https://public.com');
  });

  it('defaults proto to https when only host is present', () => {
    expect(getRequestOrigin(req({ 'x-forwarded-host': 'a.com' }))).toBe('https://a.com');
  });
});
