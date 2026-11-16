// @vitest-environment node
// Alamat overlay detail Program Inovasi di beranda: /?program={id}.
import { describe, expect, it } from 'vitest';
import {
  isPlainLeftClick,
  PROGRAM_PARAM,
  programOverlayHref,
  readProgramParam,
} from '@/app/(public)/_com/main-page/landing-page/program-param.logic';

const params = (query: string) => new URLSearchParams(query);
const click = (over: Partial<Parameters<typeof isPlainLeftClick>[0]> = {}) => ({
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  ...over,
});

describe('programOverlayHref', () => {
  it('membentuk alamat beranda dengan param program', () => {
    expect(PROGRAM_PARAM).toBe('program');
    expect(programOverlayHref('cm1abc')).toBe('/?program=cm1abc');
  });

  it('meng-encode id agar tidak merusak query', () => {
    expect(programOverlayHref('a b&c=d')).toBe('/?program=a%20b%26c%3Dd');
    expect(programOverlayHref(42)).toBe('/?program=42');
  });

  it('bolak-balik: id yang dibentuk terbaca kembali utuh', () => {
    const href = programOverlayHref('a b&c');
    expect(readProgramParam(new URL(href, 'http://x').searchParams)).toBe('a b&c');
  });
});

describe('readProgramParam', () => {
  it('membaca id dan membuang spasi tepi', () => {
    expect(readProgramParam(params('program=cm1abc'))).toBe('cm1abc');
    expect(readProgramParam(params('program=%20cm1abc%20'))).toBe('cm1abc');
  });

  it('param tidak ada, kosong, atau spasi saja → null (overlay tertutup)', () => {
    expect(readProgramParam(params(''))).toBeNull();
    expect(readProgramParam(params('program='))).toBeNull();
    expect(readProgramParam(params('program=%20%20'))).toBeNull();
    expect(readProgramParam(params('lain=1'))).toBeNull();
    expect(readProgramParam(null)).toBeNull();
    expect(readProgramParam(undefined)).toBeNull();
  });
});

describe('isPlainLeftClick', () => {
  it('klik kiri biasa → buka overlay di tempat', () => {
    expect(isPlainLeftClick(click())).toBe(true);
  });

  it('klik tengah/kanan, modifier, atau sudah dicegah → biarkan browser', () => {
    expect(isPlainLeftClick(click({ button: 1 }))).toBe(false);
    expect(isPlainLeftClick(click({ button: 2 }))).toBe(false);
    expect(isPlainLeftClick(click({ metaKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ ctrlKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ shiftKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ altKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ defaultPrevented: true }))).toBe(false);
  });
});
